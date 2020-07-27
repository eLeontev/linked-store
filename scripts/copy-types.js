const fs = require('fs');

const source = 'types/index.d.ts';
const destination = 'dist/index.d.ts';

fs.copyFileSync(source, destination);
