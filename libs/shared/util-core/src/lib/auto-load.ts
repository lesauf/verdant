import { kebabCaseToCamelCase } from './string-utils';

interface AutoLoadOptions {
    /** If true, merge all named exports into the root object instead of nesting them under the filename. */
    flatten?: boolean;
}

/**
 * Universal auto-load utility.
 * 
 * Supports:
 * 1. Node.js: Pass an absolute directory path (string). Uses 'fs' and 'path'.
 * 2. Metro/Webpack: Pass a context from 'require.context()'.
 * 
 * @param source Either a directory path (Node) or a require.context result (Metro).
 * @param options Loading options.
 */
export function autoLoad(source: any, options: AutoLoadOptions = {}): Record<string, any> {
    const modules: Record<string, any> = {};
    const { flatten = false } = options;

    const processModule = (name: string, moduleContent: any) => {
        if (flatten) {
            // Merge all named exports into the root
            // If it's an ESM module with a __esModule flag or just an object of exports
            Object.keys(moduleContent).forEach(exportName => {
                if (exportName !== '__esModule' && exportName !== 'default') {
                    modules[exportName] = moduleContent[exportName];
                }
            });
            // Also include default if it exists and isn't already included
            if (moduleContent.default) {
                const camelName = kebabCaseToCamelCase(name);
                if (!modules[camelName]) {
                    modules[camelName] = moduleContent.default;
                }
            }
        } else {
            // Nest under camelCased filename
            modules[kebabCaseToCamelCase(name)] = moduleContent.default || moduleContent;
        }
    };

    // Check if it's a require.context (function with .keys property)
    if (typeof source === 'function' && typeof source.keys === 'function') {
        source.keys().forEach((key: string) => {
            const filename = key.split('/').pop() || '';
            const name = filename.split('.')[0];
            
            if (name && name !== 'index') {
                try {
                    const moduleContent = source(key);
                    processModule(name, moduleContent);
                } catch (err) {
                    console.error(`[autoLoad] Failed to load module from context: ${key}`, err);
                }
            }
        });
        return modules;
    }

    // Node.js fallback
    if (typeof source === 'string') {
        try {
            // Use eval('require') to prevent Metro bundler from trying to resolve Node.js modules
            const nodeRequire = eval('require');
            const fs = nodeRequire('fs');
            const path = nodeRequire('path');

            if (!fs || !fs.readdirSync) {
                return {};
            }

            fs.readdirSync(source)
                .filter((file: string) => {
                    return (
                        file !== 'index.ts' && 
                        file !== 'index.js' && 
                        (file.endsWith('.ts') || file.endsWith('.js')) && 
                        !file.includes('.test') &&
                        !file.includes('.spec') &&
                        !file.endsWith('.d.ts')
                    );
                })
                .forEach((file: string) => {
                    try {
                        const filePath = path.join(source, file);
                        const module = nodeRequire(filePath);
                        const name = file.split('.')[0];
                        processModule(name, module);
                    } catch (err) {
                        // Silently fail if not in a Node environment or file cannot be required
                    }
                });
        } catch (error) {
            // Silently fail if eval('require') is not available (browser/Metro)
        }
        return modules;
    }

    console.error('[autoLoad] Invalid source provided. Expected string root or require.context.');
    return {};
}
