# md2sv

Extensible Markdown-to-Svelte transpiler.

## Background

For my blog I needed a *Markdown-to-Svelte* transpiler.
The most popular option was [MDsveX](https://github.com/pngwn/MDsveX),
but after failing to integrate with it various modern versions of plugins
from the *Unified.js/Micromark/Remark/Rehype* ecosystem,
I found this: https://github.com/pngwn/MDsveX/discussions/236#discussioncomment-672015 .
This is still an issue at the time of writing.
MDsveX also coupled my code base to a major version of Svelte that I was not using.
While trying to adapt it, I stumbled over approx. 19k LOC of its monorepo (as counted by `cloc --vcs=git`).
All of this disqualified MDsveX for my purpose.

Thus this re-implementation of a Markdown-to-Svelte transpiler based on a few
observations (see [Rationale](#rationale)) that made it possible to achieve *roughly the same* in **just over 120 lines of code**.


## Architecture

Based on a [Unified.js](https://github.com/unifiedjs/unified) pipeline without parsing Svelte code.
See [Features](#features) section below.

### Rationale

The following basic observations allow an extremely lean *Markdown-to-Svelte* transformation pipeline:

1. Svelte basically has [HTML](https://svelte.dev/docs/basic-markup) syntax; only curly braces are special.
2. Markdown-to-HTML transpilers are ubiquitous.
3. Markdown may contain arbitrary HTML tags which are not transformed.

It follows that the 'core feature' of `md2sv` (and `MDsveX` by extension) comes absolutely for free.
This is reflected in the fact that it is hard to tell if a source is 'Svelte in Markdown' or 'Markdown in Svelte'.
Both are valid Markdown or Svelte.
In other words, any Markdown-to-HTML transpiler **already does** 'MDX for Svelte', and a library is redundant.

Why, then, create a library anyway? See [Features](#features) section.


## Features

1. **Escape curly brace literals** as `{'{'}` and `{'}'}` (even though they are rare in prose).
2. **Raw code:** If you need to ensure that specific text is not transformed at all (e.g. for
   any Svelte code), then `md2sv` provides to to you a
   [Markdown Directive](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) named `raw`
3. **Parse "frontmatter"** and serialize it into `export` statements in Svelte's `<script context="module">`.
   This makes the keys defined in the frontmatter available as attributes of the Svelte component.
4. **Extensibility**: Inject *remark* and *rehype* plugins into specific points of the transformation pipeline.

For illustration, see the [unit tests](test) and the [example](example), in particular the
[input](https://raw.githubusercontent.com/michaelfranzl/md2sv/main/example/input.md) and the
[output](https://raw.githubusercontent.com/michaelfranzl/md2sv/main/example/output.svelte).

### Non-features

The following were intentionally not implemented; however, since *md2sv* is easy to extend,
**the following functionality can easily be added by yourself if and wherever you need it** using
`rehypePlugins{Pre,Post}` and `remarkPlugins{Pre,Post}` (see *Options* section).

* Syntax highlighting
* Smart typography
* GFM (footnotes, strikethrough, autolinks)
* any other feature of the hundreds of *Unified.js/Micromark/Mdast/Hast* ecosystem

For a rich example pipeline having all those features, see [example](example).


## API

`md2sv` is a factory, taking an options object of type `ProcessorOptions`;
it returns a pipeline of type *Unified.js* `Processor`.


### `ProcessorOptions`

Custom plugins can be injected at various locations:

`remarkPluginsPre`: before md2sv's remark plugins

`remarkPluginsPost`: after md2sv's remark plugins (just before rehype translation)

`rehypePluginsPre`: before md2sv's rehype plugins (just after rehype translation)

`rehypePluginsPost`: after md2sv's rehype plugins (just before HTML serialization)


## Use as a SvelteKit preprocessor

Add the following preprocessor object to your `svelte.config.js`:

```js
		{
			name: 'md2sv',
			markup: ({ content, filename }) => {
				if (!['mdx', 'md'].includes(filename.split('.').pop())) return;

				const file = new VFile({ path: filename, value: content });
				md2sv().processSync(file);
				return {
					code: file.value,
					data: file.data,
					map: '',
				};
			},
		}
```
