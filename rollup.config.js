import base from './node_modules/@mparticle/web-kit-wrapper/rollup.base';

const input = base.input;
const output = {
    ...base.output,
    name: 'mpOptimizelyKit'
};
const plugins = [...base.plugins];

const rootFolderConfig = {
    input,
    output: {
        ...output,
        format: 'iife',
        file: 'Optimizely.js'
    },
    plugins: [...plugins]
};

const buildFolderConfig = {
    input,
    output: {
        ...output,
        format: 'iife',
        file: 'dist/OptimizelyKit.iife.js'
    },
    plugins: [...plugins]
};

const npmFolderConfig = {
    input,
    output: {
        ...output,
        format: 'cjs',
        file: 'dist/OptimizelyKit.common.js'
    },
    plugins: [...plugins]
};

export default [rootFolderConfig, buildFolderConfig, npmFolderConfig];
