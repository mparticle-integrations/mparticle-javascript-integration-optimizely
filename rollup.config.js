// This file is all boilerplate. Do not edit unless you know what you're doing.

import {
    production,
    testEndToEnd,
} from './node_modules/@mparticle/web-kit-wrapper/rollup.base';

const { ENVIRONMENT } = process.env;
const initialization = require('./src/initialization');

const productionBuilds = {
    iife: {
        input: production.input,
        output: {
            ...production.output,
            format: 'iife',
            file: `dist/${initialization.name}Kit.iife.js`,
            name: `${initialization.name}Kit`,
        },
        plugins: [...production.plugins],
    },
    // Remove rootIife in a future build once the database is updated to use dist/ iife instead
    rootIife: {
        input: production.input,
        output: {
            ...production.output,
            format: 'iife',
            file: 'Optimizely.js',
            name: 'mpOptimizelyKit',
        },
        plugins: [...production.plugins],
    },
    cjs: {
        input: production.input,
        output: {
            ...production.output,
            format: 'cjs',
            file: `dist/${initialization.name}Kit.common.js`,
            name: `${initialization.name}Kit`,
        },
        plugins: [...production.plugins],
    },
};

const testEndToEndBuild = {
    input: testEndToEnd.input,
    output: {
        ...testEndToEnd.output,
        format: 'iife',
        file: 'test/end-to-end-testapp/build/compilation.js',
        name: `${initialization.name}Kit`,
    },
    plugins: [...testEndToEnd.plugins],
};

let selectedBuilds = [];
if (ENVIRONMENT === 'production') {
    selectedBuilds.push(
        productionBuilds.iife,
        productionBuilds.rootIife,
        productionBuilds.cjs
    );
} else if (ENVIRONMENT === 'testEndToEnd') {
    selectedBuilds.push(testEndToEndBuild);
}

export default selectedBuilds;
