// md2sv -- Extensible Markdown-to-Svelte transpiler
// Copyright (C) 2024 Michael Franzl
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


/**
* @typedef {import('unified').Plugin} Plugin
* @typedef {import('unified').Processor} Processor
* @typedef {import('vfile').VFile} Vfile
* @typedef {import('hast').Root} HastRoot
* @typedef {import('mdast').Root} MdastRoot
*
* @typedef {Object} ProcessorOptions
* @property {Array<Plugin<[], MdastRoot>>} remarkPluginsPre
* @property {Array<Plugin<[], MdastRoot>>} remarkPluginsPost
* @property {Array<Plugin<[], HastRoot>>} rehypePluginsPre
* @property {Array<Plugin<[], HastRoot>>} rehypePluginsPost
*/

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import remarkDirective from 'remark-directive';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import { visitParents as visit } from 'unist-util-visit-parents';
import { matter as parseFrontmatter } from 'vfile-matter';

/**
 * @param {ProcessorOptions} options
 * @returns {Processor}
 */
export default function({
	remarkPluginsPre = [],
	remarkPluginsPost = [],
	rehypePluginsPre = [],
	rehypePluginsPost = [],
}) {
	const regexpBraces = new RegExp('[{}]', 'g');

	/**
	* @param {string} input
	*/
	function escapeCurlyBracesForSvelte(input) {
		let /** @type {RegExpExecArray | null} */ match;
		let result = '';
		let lastIdx = 0;
		while ((match = regexpBraces.exec(input)) !== null) {
			const prefix = input.substring(lastIdx, match.index);
			result += prefix;
			result += match[0] == '{' ? "{'{'}" : "{'}'}";
			lastIdx = match.index + 1;
		}
		if (lastIdx === 0) return input;

		const rest = input.substring(lastIdx);
		result += rest;
		return result;
	}

	const md2svCustomRawNode = '__md2sv_raw';

	const processor = unified()

		// inject user plugins
		.use(remarkPluginsPre)

		// parse the frontmatter from the file and expose it as file.data.matter. Only YAML is supported.
		// see https://github.com/vfile/vfile-matter
		.use(() => (_tree, file) => parseFrontmatter(file))

		// Extend remark-parse to put the frontmatter into a dedicated AST node.
		// It will not be used; it just makes sure that it will not be parsed as regular Markdown later.
		// remark-frontmatter also doesn't parse the contents of the frontmatter, instead we use vfile-matter, injected into the pipeline elsewhere.
		// see https://github.com/remarkjs/remark-frontmatter
		.use(remarkFrontmatter)

		// Extend remark-parse for Markdown directives.
		// see https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
		.use(remarkDirective)

		// now that we have injected various functionalities, parse Markdown into an Mdast AST
		.use(remarkParse)

		// custom processing of the Markdown AST
		.use(() => (/** @type {MdastRoot} */ tree) => {
			visit(tree, (node) => {
				// change to custom node types for Markdown Directives named 'raw'.
				// this ensures that this content is only handled by us.
				if (node.name == 'raw') {
					switch (node.type) {
						case 'textDirective':
							node.type = '__md2sv_textDirective';
							break;
						case 'leafDirective':
							node.type = '__md2sv_leafDirective';
							break;
						case 'containerDirective':
							node.type = '__md2sv_containerDirective';
							break;
					}
				}
			})
		})

		// inject user plugins
		.use(remarkPluginsPost)

		// remark-rehype wraps mdast-util-to-hast.
		// converts the mdast tree to a hast tree.
		// see https://github.com/remarkjs/remark-rehype
		// All subsequent plugins will receive the hast tree.
		.use(remarkRehype, {
			// Keep HTML tags from the input as raw hast nodes They will not be processed at all.
			allowDangerousHtml: true,

			handlers: {
				__md2sv_containerDirective: (state, node) => {
					// WARN
					// node.position.end.offset is wrong. This might be a bug in micromark-extension-directive.
					// As a workaround, let's work with line numbers.
					const rawtext = state.options.file.value.toString().split('\n').slice(node.position.start.line + 1, node.position.end.line - 1).join('\n')
					node.children.length = 0; // efficiently empty the array
					return { type: md2svCustomRawNode, value: rawtext }
				},
				__md2sv_leafDirective: (state, node) => {
					// remark-directive descends into the text (inside the square brackets), but we want this
					// to be raw, so we have to get back to the original source text, sans the ::raw[]
					const rawtext = state.options.file.value.toString().substring(node.position.start.offset + 6, node.position.end.offset - 1)
					node.children.length = 0; // efficiently empty the array
					return { type: md2svCustomRawNode, value: rawtext }
				},
				__md2sv_textDirective: (state, node) => {
					// remark-directive descends into the text (inside the square brackets), but we want this
					// to be raw, so we have to get back to the original source text, sans the :raw[]
					const rawtext = state.options.file.value.toString().substring(node.position.start.offset + 5, node.position.end.offset - 1)
					node.children.length = 0; // efficiently empty the array
					return { type: md2svCustomRawNode, value: rawtext }
				}
			},
		})

		// inject user plugins
		.use(rehypePluginsPre)

		.use(() => (/** @type {HastRoot} */ tree) => {
			visit(tree, 'text', (node, ancestors) => {
				const parent = ancestors[ancestors.length - 1];
				if (['style', 'svg'].includes(parent.tagName)) return;

				node.value = escapeCurlyBracesForSvelte(node.value);
			});
		})

		// parse raw HTML in type raw nodes
		.use(rehypeRaw, { passThrough: [md2svCustomRawNode] })

		// Custom processing of the hast AST
		.use(() => (/** @type {HastRoot} */ tree, /** @type {VFile} */ vFile) => {
			// Make the metadata available as Svelte component attributes.
			// We do this by serializing that data as JavaScript code inside Svelte's <script context="module"> tag
			const metadata = vFile.data.matter;
			if (Object.keys(metadata).length > 0) {
				// expose the metadata in two ways, for convenience:
				const metadataCode = `
export const metadata = ${JSON.stringify(metadata)};
export const { ${Object.keys(metadata).join(', ')} } = metadata;
`;

				const scriptNode = tree.children.find(
					(el) => el.tagName === 'script' && el.properties.context === 'module'
				);
				if (scriptNode) {
					// append to an existing script tag
					scriptNode.children[0].value += metadataCode;
				} else {
					// create a new script tag
					tree.children.unshift({
						type: 'element',
						tagName: 'script',
						properties: { context: 'module' },
						children: [
							{
								type: 'text',
								value: metadataCode,
							},
						],
					});
				}
			}

			// convert our own raw nodes to raw hast nodes, so that nothing will be escaped in HTML
			visit(tree, md2svCustomRawNode, (node) => node.type = 'raw');
		})

		// inject user plugins
		.use(rehypePluginsPost)

		// Wraps toHtml() of hast-util-to-html (using https://github.com/wooorm/zwitch)
		// The recognized node types are: comment, doctype, element, raw, root, text.
		// This list cannot be extended.
		// see https://github.com/syntax-tree/hast-util-to-html/blob/9.0.1/lib/handle/index.js#L22
		// see https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify
		.use(rehypeStringify, {
			allowDangerousHtml: true, // iow. output the value of raw type nodes
			allowDangerousCharacters: false,
			characterReferences: {
				useNamedReferences: true,
			},
		});

	return processor;
}
