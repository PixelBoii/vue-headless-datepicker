import vue from 'rollup-plugin-vue';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                format: 'esm',
                file: 'dist/index.mjs',
            },
            {
                format: 'cjs',
                file: 'dist/index.cjs',
            },
        ],
        plugins: [
            vue(),
            peerDepsExternal(),
            nodeResolve({
                modulesOnly: true,
            }),
            typescript({
                tsconfig: './tsconfig.json',
                exclude: [
                    './src/stories/*',
                ],
                outDir: './dist',
                declaration: true,
                declarationDir: './dist/types',
            }),
        ],
    },
    {
        input: './dist/types/index.d.ts',
        output: [
            {
                file: 'dist/index.d.ts',
                format: 'es',
            },
        ],
        plugins: [dts()],
    },
];
