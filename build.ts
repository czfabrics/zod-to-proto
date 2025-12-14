import { build, BuildOptions } from 'esbuild'

const BUILD_CONFIGURATION: BuildOptions = {
    entryPoints: ['index.ts'],
    entryNames: '[name]',
    outdir: '.dist',
    outExtension: {
        '.js': '.mjs',
    },
    packages: 'external',
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    bundle: false,
    minify: true,
    sourcemap: false,
    tsconfig: './tsconfig.json',
} as const

build(BUILD_CONFIGURATION)
    .then(() => {
        console.log('Build succeeded')
    })
    .catch((error) => {
        console.error('Build failed:', error)

        process.exitCode = 1
    })
