<script context="module">
  const myvar = "hello";

export const metadata = {"mykey":["my","array"]};
export const { mykey } = metadata;
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
<h2>md2sv</h2>
<p>This document is valid <em>Markdown-in-Svelte</em> or <em>Svelte-in-Markdown</em>, depending on the way you look
at it, since Svelte is basically HTML, and Markdown can hold arbitrary <i>HTML</i> which it does not
transform. It follows that “Markdown-to-Svelte” is actually a no-op. Why, then, is there a need for
a library?</p>
<h3>Features</h3>
<h4>Curly braces</h4>
<p>Svelte’s {'{'} and {'}'} are special, so, for the writer’s convenience, they are escaped by <em>md2sv</em>.</p>
<h4>‘Frontmatter’</h4>
<p>Since the beginning of static website generators (Jekyll, Webgen, etc.), the blog post files were
actually in YAML format. The first YAML document (delimited by <code>---</code>) by convention is called the
‘frontmatter’. <code>md2sv</code> parses this data and adds it to Svelte’s (maybe pre-existing)
<em>module-context script</em>. This way, the defined key/value pairs become properties of the Svelte
component itself.</p>
<h4>Raw text</h4>
<p><em>md2sv</em> offers a <a href="https://talk.commonmark.org/t/generic-directives-plugins-syntax/444">Markdown Directive</a>
named “raw”, i.e. <code>:raw[text]</code> (inline-level), <code>::raw[text]</code> (paragraph-level) and <code>:::raw</code>
(block-level) where you can put text that is <strong>guaranteed not to be touched</strong> by <em>md2sv</em> or by any
<em>Unified.js</em> pipeline plugin like smart typography, syntax highlighting, or anything else.
Typically, you would use this feature for, but not limited to, Svelte code.
Following are a few examples.</p>
<h5>The block version (using <code>:::raw</code>)</h5>
<svelte:window bind:scrollY={scrollY} />

<ul>
{#each objects as {id, name}}
  <li>{id > 2 ? name : `--${name}--`}</li>
{/each}
</ul>

<Note>Text for the note</Note>
<h5>The inline version (using <code>:raw</code>)</h5>
<p>The <code>display</code> variable is set to {display ? 'TRUE' : 'FALSE'}.</p>
<p>Note that in the code for the last sentence, the Svelte code is not broken by ‘smart typography’
even though we used the same single quotation mark everywhere.</p>
<p>The current browser window scroll position stored in <code>scrollY</code> is <big><b>{scrollY}</b></big>.</p>
<h5>The leaf version (using <code>::raw</code>)</h5>
<p>The following Markdown text is output only if <code>display == true</code>:</p>
{#if display}
<p>Maybe, just <em>maybe</em>.</p>
{/if}
<h4>Extensibility</h4>
<p><em>md2sv</em>’s default pipeline is freely extensible. Below are just a few ideas of what is possible:</p>
<h5>GFM</h5>
<p>In case you extend <em>md2sv</em>’s default pipeline, you can also use ‘smart’ “typography”… or even
GFM (GitHub-flavored Markdown), like <del>strikethrough</del> or <a href="http://autolinks">http://autolinks</a> or footnotes<sup><a href="#user-content-fn-myfootnote" id="user-content-fnref-myfootnote" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>
<h5>Syntax highlighting</h5>
<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> x == <span class="hljs-string">"42"</span>;
</code></pre>
<h5>Math typesetting</h5>
<p>Math is typeset by surrounding it by $ characters.</p>
<p>Like this: <mjx-container class="MathJax" jax="SVG"><svg style="vertical-align: -0.186ex;" xmlns="http://www.w3.org/2000/svg" width="10.836ex" height="2.072ex" role="img" focusable="false" viewBox="0 -833.9 4789.6 915.9" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path id="MJX-1-TEX-I-1D438" d="M492 213Q472 213 472 226Q472 230 477 250T482 285Q482 316 461 323T364 330H312Q311 328 277 192T243 52Q243 48 254 48T334 46Q428 46 458 48T518 61Q567 77 599 117T670 248Q680 270 683 272Q690 274 698 274Q718 274 718 261Q613 7 608 2Q605 0 322 0H133Q31 0 31 11Q31 13 34 25Q38 41 42 43T65 46Q92 46 125 49Q139 52 144 61Q146 66 215 342T285 622Q285 629 281 629Q273 632 228 634H197Q191 640 191 642T193 659Q197 676 203 680H757Q764 676 764 669Q764 664 751 557T737 447Q735 440 717 440H705Q698 445 698 453L701 476Q704 500 704 528Q704 558 697 578T678 609T643 625T596 632T532 634H485Q397 633 392 631Q388 629 386 622Q385 619 355 499T324 377Q347 376 372 376H398Q464 376 489 391T534 472Q538 488 540 490T557 493Q562 493 565 493T570 492T572 491T574 487T577 483L544 351Q511 218 508 216Q505 213 492 213Z"></path><path id="MJX-1-TEX-N-3D" d="M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z"></path><path id="MJX-1-TEX-I-1D45A" d="M21 287Q22 293 24 303T36 341T56 388T88 425T132 442T175 435T205 417T221 395T229 376L231 369Q231 367 232 367L243 378Q303 442 384 442Q401 442 415 440T441 433T460 423T475 411T485 398T493 385T497 373T500 364T502 357L510 367Q573 442 659 442Q713 442 746 415T780 336Q780 285 742 178T704 50Q705 36 709 31T724 26Q752 26 776 56T815 138Q818 149 821 151T837 153Q857 153 857 145Q857 144 853 130Q845 101 831 73T785 17T716 -10Q669 -10 648 17T627 73Q627 92 663 193T700 345Q700 404 656 404H651Q565 404 506 303L499 291L466 157Q433 26 428 16Q415 -11 385 -11Q372 -11 364 -4T353 8T350 18Q350 29 384 161L420 307Q423 322 423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 181Q151 335 151 342Q154 357 154 369Q154 405 129 405Q107 405 92 377T69 316T57 280Q55 278 41 278H27Q21 284 21 287Z"></path><path id="MJX-1-TEX-N-2217" d="M229 286Q216 420 216 436Q216 454 240 464Q241 464 245 464T251 465Q263 464 273 456T283 436Q283 419 277 356T270 286L328 328Q384 369 389 372T399 375Q412 375 423 365T435 338Q435 325 425 315Q420 312 357 282T289 250L355 219L425 184Q434 175 434 161Q434 146 425 136T401 125Q393 125 383 131T328 171L270 213Q283 79 283 63Q283 53 276 44T250 35Q231 35 224 44T216 63Q216 80 222 143T229 213L171 171Q115 130 110 127Q106 124 100 124Q87 124 76 134T64 161Q64 166 64 169T67 175T72 181T81 188T94 195T113 204T138 215T170 230T210 250L74 315Q65 324 65 338Q65 353 74 363T98 374Q106 374 116 368T171 328L229 286Z"></path><path id="MJX-1-TEX-I-1D450" d="M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z"></path><path id="MJX-1-TEX-N-32" d="M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="scale(1,-1)"><g data-mml-node="math"><g data-mml-node="mi"><use data-c="1D438" xlink:href="#MJX-1-TEX-I-1D438"></use></g><g data-mml-node="mo" transform="translate(1041.8,0)"><use data-c="3D" xlink:href="#MJX-1-TEX-N-3D"></use></g><g data-mml-node="mi" transform="translate(2097.6,0)"><use data-c="1D45A" xlink:href="#MJX-1-TEX-I-1D45A"></use></g><g data-mml-node="mo" transform="translate(3197.8,0)"><use data-c="2217" xlink:href="#MJX-1-TEX-N-2217"></use></g><g data-mml-node="msup" transform="translate(3920,0)"><g data-mml-node="mi"><use data-c="1D450" xlink:href="#MJX-1-TEX-I-1D450"></use></g><g data-mml-node="mn" transform="translate(466,363) scale(0.707)"><use data-c="32" xlink:href="#MJX-1-TEX-N-32"></use></g></g></g></g></svg></mjx-container>.</p>
<section data-footnotes="" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-myfootnote">
<p>Indeed. <a href="#user-content-fnref-myfootnote" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
</li>
</ol>
</section><style>
mjx-container[jax="SVG"] {
  direction: ltr;
}

mjx-container[jax="SVG"] > svg {
  overflow: visible;
  min-height: 1px;
  min-width: 1px;
}

mjx-container[jax="SVG"] > svg a {
  fill: blue;
  stroke: blue;
}

mjx-container[jax="SVG"][display="true"] {
  display: block;
  text-align: center;
  margin: 1em 0;
}

mjx-container[jax="SVG"][display="true"][width="full"] {
  display: flex;
}

mjx-container[jax="SVG"][justify="left"] {
  text-align: left;
}

mjx-container[jax="SVG"][justify="right"] {
  text-align: right;
}

g[data-mml-node="merror"] > g {
  fill: red;
  stroke: red;
}

g[data-mml-node="merror"] > rect[data-background] {
  fill: yellow;
  stroke: none;
}

g[data-mml-node="mtable"] > line[data-line], svg[data-table] > g > line[data-line] {
  stroke-width: 70px;
  fill: none;
}

g[data-mml-node="mtable"] > rect[data-frame], svg[data-table] > g > rect[data-frame] {
  stroke-width: 70px;
  fill: none;
}

g[data-mml-node="mtable"] > .mjx-dashed, svg[data-table] > g > .mjx-dashed {
  stroke-dasharray: 140;
}

g[data-mml-node="mtable"] > .mjx-dotted, svg[data-table] > g > .mjx-dotted {
  stroke-linecap: round;
  stroke-dasharray: 0,140;
}

g[data-mml-node="mtable"] > g > svg {
  overflow: visible;
}

[jax="SVG"] mjx-tool {
  display: inline-block;
  position: relative;
  width: 0;
  height: 0;
}

[jax="SVG"] mjx-tool > mjx-tip {
  position: absolute;
  top: 0;
  left: 0;
}

mjx-tool > mjx-tip {
  display: inline-block;
  padding: .2em;
  border: 1px solid #888;
  font-size: 70%;
  background-color: #F8F8F8;
  color: black;
  box-shadow: 2px 2px 5px #AAAAAA;
}

g[data-mml-node="maction"][data-toggle] {
  cursor: pointer;
}

mjx-status {
  display: block;
  position: fixed;
  left: 1em;
  bottom: 1em;
  min-width: 25%;
  padding: .2em .4em;
  border: 1px solid #888;
  font-size: 90%;
  background-color: #F8F8F8;
  color: black;
}

foreignObject[data-mjx-xml] {
  font-family: initial;
  line-height: normal;
  overflow: visible;
}

mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c] {
  stroke-width: 3;
}
</style>