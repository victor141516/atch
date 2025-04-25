import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/atch.js',
			format: 'cjs',
			sourcemap: true
		},
		{
			file: 'dist/atch.mjs',
			format: 'esm',
			sourcemap: true
		},
		{
			file: 'dist/atch.umd.js',
			format: 'umd',
			name: 'atch',
			sourcemap: true
		}
	],
	plugins: [resolve(), commonjs(), typescript()]
};
