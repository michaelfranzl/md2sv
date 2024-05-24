import { expect, it } from 'vitest'
import { VFile } from 'vfile';
import makeProcessor from '../src';

function process(value, options = {}) {
	const file = new VFile({ value })
	makeProcessor(options).process(file);
	return file.value;
}

it('converts basic Markdown to HTML', () => {
	expect(process('hello **world**'))
		.toStrictEqual('<p>hello <strong>world</strong></p>');
});

it('keeps an isolated $', () => {
	expect(process('$'))
		.toStrictEqual('<p>$</p>');
});

it('escapes an isolated <', () => {
	expect(process('a < b'))
		.toStrictEqual('<p>a &lt; b</p>');
});

it('escapes an isolated < (in a code block)', () => {
	expect(process('`a < b`'))
		.toStrictEqual('<p><code>a &lt; b</code></p>');
});

it('escapes <> in inline code', () => {
	expect(process('enter the `<html>` tag'))
		.toStrictEqual('<p>enter the <code>&lt;html></code> tag</p>');
});

it('escapes <> in normal text', () => {
	expect(process('enter the <> tag'))
		.toStrictEqual('<p>enter the &lt;> tag</p>');
});

it('leaves HTML tags alone (basic)', () => {
	expect(process('<b>bold</b>'))
		.toStrictEqual('<p><b>bold</b></p>');
});

it('leaves HTML tags alone (Svelte component tag with handler and attribute)', () => {
	expect(process('::raw[<MyComponent on:click="{onClick}" myattr="22" />]'))
		.toStrictEqual('<MyComponent on:click="{onClick}" myattr="22" />');
});

it('leaves HTML tags alone (basic HTML with Svelte handler)', () => {
	expect(process('<button on:click="{click}">stuff</button>'))
		.toStrictEqual('<p><button on:click="{click}">stuff</button></p>');
});

it('leaves HTML tags alone (div with Svelte handler anonymous function)', () => {
	expect(process('<div on:click="{(e) => rateChange(rate)}">stuff</div>'))
		.toStrictEqual('<div on:click="{(e) => rateChange(rate)}">stuff</div>');
});

it('leaves HTML tags alone (button with Svelte handler anonymous function)', () => {
	expect(process('<button on:click="{(e) => rateChange(rate)}">stuff</button>'))
		.toStrictEqual('<p><button on:click="{(e) => rateChange(rate)}">stuff</button></p>');
});

it('escapes curly braces', () => {
	expect(process('{test}'))
		.toStrictEqual("<p>{'{'}test{'}'}</p>");
});

it('escapes curly braces (inside inline code tag)', () => {
	expect(process('`{}`'))
		.toStrictEqual("<p><code>{'{'}{'}'}</code></p>");
});

it('escapes curly braces (inside block code tag)', () => {
	const content = `
\`\`\`
const x = {};
\`\`\`
	`
	expect(process(content))
		.toStrictEqual("<pre><code>const x = {'{'}{'}'};\n</code></pre>");
});

it('does not escape curly braces in styles', () => {
	expect(process('<style>p { color: blue; }</style>'))
		.toStrictEqual('<style>p { color: blue; }</style>');
});

it('does not transform a Markdown inline directive named `raw`', () => {
	expect(process(':raw[{1 + 2}]'))
		.toStrictEqual('<p>{1 + 2}</p>');
});

it('does not transform a Markdown inline directive named `raw` (smart typography)', () => {
	expect(process(':raw[{"hello"}]'))
		.toStrictEqual('<p>{"hello"}</p>');
});

it('does not transform a Markdown inline directive named `raw` (smart typography)', () => {
	expect(process(':raw[{`${"hello"}`}]'))
		.toStrictEqual('<p>{`${"hello"}`}</p>');
});

it('does not transform a Markdown inline directive named `raw` (object literal)', () => {
	expect(process(':raw[{{a: 3}}]'))
		.toStrictEqual('<p>{{a: 3}}</p>');
});

it('does not transform a Markdown leaf directive named `raw` to raw Svelte code', () => {
	const content = `
::raw[{#if display}]
Some *Markdown* displayed.
::raw[{/if}]
	`;
	expect(process(content))
		.toStrictEqual('{#if display}\n<p>Some <em>Markdown</em> displayed.</p>\n{/if}');
});

it('does not transform a Markdown leaf directive named `raw` (smart typography)', () => {
	expect(process('::raw[{`${"hello"}`}]'))
		.toStrictEqual('{`${"hello"}`}');
});


it('translates a Markdown container directive named `raw` to raw Svelte code', () => {
	const content = `
before

:::raw

{#each object as {id, name}}
<li>{id < 3 ? 'yes' : 'no'}</li>
{/each}

:::

after
	`;
	expect(process(content))
		.toStrictEqual(`<p>before</p>
{#each object as {id, name}}
<li>{id < 3 ? 'yes' : 'no'}</li>
{/each}

<p>after</p>`);
});

it('escapes Svelte\'s special {} in a code tag', () => {
	expect(process(`
:::raw

<svelte:window on:event={handler} />

:::
`))
		.toStrictEqual(`<svelte:window on:event={handler} />
`);
});

it('puts frontmatter into a context module script', () => {
	const content = `---
abc: def
---

test
`;

	expect(process(content))
		.toEqual(`<script context="module">
export const metadata = {"abc":"def"};
export const { abc } = metadata;
</script><p>test</p>`);
});

it('puts frontmatter into an existing context module script', () => {
	const content = `---
abc: def
---

<script context="module">
const x = 42;
</script>

test
`;

	expect(process(content))
		.toEqual(`<script context="module">
const x = 42;

export const metadata = {"abc":"def"};
export const { abc } = metadata;
</script>
<p>test</p>`);
});


it('can handle a typical Svelte file', () => {
	const content = `---
abc: def
---

text0

<!-- comment -->

<script>
import { stuff } from 'lib';
export const y = 10;
</script>

text1

<style>
p { color: red; }
</style>

<i>italic</i>
<br />

text2
`;
	expect(process(content))
		.toEqual(`<script context="module">
export const metadata = {"abc":"def"};
export const { abc } = metadata;
</script><p>text0</p>
<!-- comment -->
<script>
import { stuff } from 'lib';
export const y = 10;
</script>
<p>text1</p>
<style>
p { color: red; }
</style>
<p><i>italic</i>
<br></p>
<p>text2</p>`);
});


it('runs passed remarkPlugins', () => {
	const options = {
		remarkPluginsPost: [
			() => (tree) => { tree.children[0].children[0].value = "world" },
		]
	};
	expect(process('hello', options))
		.toStrictEqual('<p>world</p>');
});

it('runs passed rehypePlugins', () => {
	const options = {
		rehypePluginsPost: [
			() => (tree) => { tree.children[0].children[0].value = "world" },
		]
	};
	expect(process('hello', options))
		.toStrictEqual('<p>world</p>');
});
