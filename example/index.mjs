import pipeline from './pipeline.mjs';

import fs from 'fs';

fs.writeFileSync('output.svelte', pipeline().processSync(fs.readFileSync('input.md')).value);

console.log('Transpiled input.md to output.svelte');
