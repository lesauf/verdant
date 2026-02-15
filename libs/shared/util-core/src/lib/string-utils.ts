/**
 * Converts kebab-case or snake_case to camelCase
 * @param str The string to convert
 */
export function kebabCaseToCamelCase(str: string): string {
    return str.replace(/[-_]([a-z0-9])/g, (g) => g[1].toUpperCase());
}

/**
 * Converts PascalCase to camelCase
 * @param str The string to convert
 */
export function pascalCaseToCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
