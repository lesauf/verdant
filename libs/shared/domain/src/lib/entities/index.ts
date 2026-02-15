import { autoLoad } from 'util-core';
// @ts-ignore - Metro specific feature
const context = require.context('./', false, /\.ts$/);
module.exports = autoLoad(context, { flatten: true });
