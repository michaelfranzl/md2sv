import md2sv from 'md2sv';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import retextSmartypants from 'retext-smartypants';
import { retext } from 'retext';
import rehypeHighlight from 'rehype-highlight';

import { visit } from 'unist-util-visit';

function smartypantsProcessor() {
	const p = retext().use(retextSmartypants);
	return function(tree) {
		visit(tree, (node, _idx, parent) => {
			if (node.type == 'text' && parent?.name != 'raw') {
				node.value = String(p.processSync(node.value));
			}
		})
	}
}

export default md2sv({
	remarkPluginsPre: [
		remarkGfm,
		remarkMath,
	],
	remarkPluginsPost: [
		smartypantsProcessor,
	],
	rehypePluginsPre: [
		rehypeHighlight,
		rehypeMathjax,
	],
	rehypePluginsPost: [
	],
});

