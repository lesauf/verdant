import { autoLoad } from 'util-core';
// This line tells Metro which folder to scan at build time
// @ts-ignore - Metro specific feature
const context = require.context('./', false, /\.(ts|tsx)$/);
// Now autoLoad handles the naming and mapping for you!
module.exports = autoLoad(context, { flatten: true });
