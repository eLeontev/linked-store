import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        plugins: [typescript()],
        input: 'src/index.ts',
        output: {
            file: `dist/index.js`,
            format: 'es',
            name: 'LinkedStore',
            exports: 'named',
        },
    },
    {
        plugins: [typescript()],
        input: 'src/index.ts',
        output: {
            file: `dist/index.production.js`,
            format: 'es',
            name: 'LinkedStore',
            exports: 'named',
            plugins: [terser()],
        },
    },
];
