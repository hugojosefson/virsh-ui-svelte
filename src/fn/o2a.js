/**
 * Converts an object into an array, so it can be iterated over by Svelte's {#each}
 * @param keyProp default 'key'
 * @param keyProp default 'value'
 * @returns {function(*=): [{key, value}]}
 */
export default (keyProp = 'key', valueProp = 'value') => o =>
  Object.entries(o).map(([key, value]) => ({ [keyProp]: key, [valueProp]: value }))
