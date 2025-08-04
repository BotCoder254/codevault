/**
 * Utility to check if a module is available and provide fallbacks
 */

/**
 * Check if a module is available
 * @param {string} moduleName - Name of the module to check
 * @returns {boolean} - Whether the module is available
 */
export function isModuleAvailable(moduleName) {
  try {
    require(moduleName);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get a module with a fallback
 * @param {string} moduleName - Name of the module to get
 * @param {object} fallback - Fallback object to use if module is not available
 * @returns {object} - The module or fallback
 */
export function getModuleWithFallback(moduleName, fallback) {
  try {
    return require(moduleName);
  } catch (e) {
    console.warn(`Module ${moduleName} not available, using fallback`);
    return fallback;
  }
}