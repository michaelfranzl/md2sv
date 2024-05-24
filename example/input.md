---
mykey:
  - my
  - array
---

<script context="module">
  const myvar = "hello";
</script>

<script>
import Note from '$lib/Note.svelte';

let scrollY;

const display = true;

const objects = [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
    { id: 3, name: 'three' },
];
</script>

## md2sv

This document is valid _Markdown-in-Svelte_ or _Svelte-in-Markdown_, depending on the way you look
at it, since Svelte is basically HTML, and Markdown can hold arbitrary <i>HTML</i> which it does not
transform. It follows that "Markdown-to-Svelte" is actually a no-op. Why, then, is there a need for
a library?

### Features

#### Curly braces

Svelte's { and } are special, so, for the writer's convenience, they are escaped by _md2sv_.

#### 'Frontmatter'

Since the beginning of static website generators (Jekyll, Webgen, etc.), the blog post files were
actually in YAML format. The first YAML document (delimited by `---`) by convention is called the
'frontmatter'. `md2sv` parses this data and adds it to Svelte's (maybe pre-existing)
_module-context script_. This way, the defined key/value pairs become properties of the Svelte
component itself.

#### Raw text

_md2sv_ offers a [Markdown Directive](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444)
named "raw", i.e. `:raw[text]` (inline-level), `::raw[text]` (paragraph-level) and `:::raw`
(block-level) where you can put text that is **guaranteed not to be touched** by _md2sv_ or by any
_Unified.js_ pipeline plugin like smart typography, syntax highlighting, or anything else.
Typically, you would use this feature for, but not limited to, Svelte code.
Following are a few examples.

##### The block version (using `:::raw`)

:::raw

<svelte:window bind:scrollY={scrollY} />

<ul>
{#each objects as {id, name}}
  <li>{id > 2 ? name : `--${name}--`}</li>
{/each}
</ul>

<Note>Text for the note</Note>
:::


##### The inline version (using `:raw`)

The `display` variable is set to :raw[{display ? 'TRUE' : 'FALSE'}].

Note that in the code for the last sentence, the Svelte code is not broken by 'smart typography'
even though we used the same single quotation mark everywhere.

The current browser window scroll position stored in `scrollY` is :raw[<big><b>{scrollY}</b></big>].


##### The leaf version (using `::raw`)

The following Markdown text is output only if `display == true`:

::raw[{#if display}]

Maybe, just _maybe_.

::raw[{/if}]


#### Extensibility

_md2sv_'s default pipeline is freely extensible. Below are just a few ideas of what is possible:

##### GFM

In case you extend _md2sv_'s default pipeline, you can also use 'smart' "typography"... or even
GFM (GitHub-flavored Markdown), like ~strikethrough~ or http://autolinks or footnotes[^myfootnote].

[^myfootnote]: Indeed.

##### Syntax highlighting

```js
const x == "42";
```

##### Math typesetting

Math is typeset by surrounding it by $ characters.

Like this: $E = m * c^2$.

