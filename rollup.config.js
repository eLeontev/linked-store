import typescript from '@rollup/plugin-typescript';

export default {
    plugins: [typescript()],
    input: 'src/index.ts',
    output: {
        file: `dist/index.js`,
        format: 'es',
        name: 'LinkedStore',
        exports: 'named',
    },
};
