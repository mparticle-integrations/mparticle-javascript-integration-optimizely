import base from './node_modules/@mparticle/web-kit-wrapper/rollup.base';

const input = base.input;
const output = {
    ...base.output,
    name: 'mp-optimizely-kit'
};
const plugins = [...base.plugins];

const rootFolderConfig = {
    input,
    output: {
        ...output,
        file: 'Optimizely-Kit.js'
    },
    plugins: [...plugins]
};

const buildFolderConfig = {
    input,
    output: {
        ...output,
        file: 'build/Optimizely-Kit.js'
    },
    plugins: [...plugins]
};

export default [rootFolderConfig, buildFolderConfig];
