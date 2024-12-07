/**
 * Checks if an array is empty.
 *
 * @template T The type of elements in the array.
 * @param array - The array to check.
 * @returns `true` if the array is empty, otherwise `false`.
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Returns `null` if the array is empty, otherwise returns the array.
 *
 * @template T The type of elements in the array.
 * @param array - The array to check.
 * @returns The array if it is not empty, otherwise `null`.
 */
export function nullIfEmpty<T>(array: T[]): T[] | null {
  return array.length === 0 ? null : array;
}

/**
 * Removes duplicates from an array.
 *
 * @template T The type of elements in the array.
 * @param array - The array from which duplicates should be removed.
 * @returns A new array without duplicates.
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Finds the maximum value in a numeric array.
 *
 * @param array - The array to find the maximum value from.
 * @returns The maximum value in the array, or `null` if the array is empty.
 */
export function findMax(array: number[]): number | null {
  return array.length === 0 ? null : Math.max(...array);
}

/**
 * Finds the minimum value in a numeric array.
 *
 * @param array - The array to find the minimum value from.
 * @returns The minimum value in the array, or `null` if the array is empty.
 */
export function findMin(array: number[]): number | null {
  return array.length === 0 ? null : Math.min(...array);
}

/**
 * Partitions an array into two groups based on a predicate function.
 *
 * @template T The type of elements in the array.
 * @param array - The array to partition.
 * @param predicate - A function to determine which group each element belongs to.
 * @returns A tuple where the first element is an array of elements that satisfy the predicate,
 *          and the second element is an array of elements that do not.
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  return array.reduce(
    (acc, item) => {
      predicate(item) ? acc[0].push(item) : acc[1].push(item);
      return acc;
    },
    [[], []] as [T[], T[]],
  );
}

/**
 * Flattens a nested array to a single level.
 *
 * @template T The type of elements in the array.
 * @param array - The nested array to flatten.
 * @returns A new array that is flattened to one level.
 */
export function flatten<T>(array: T[][]): T[] {
  return array.flat();
}
