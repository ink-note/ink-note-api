/**
 * Filters out the keys specified in the 'keys' array from the input object 'data' and returns a new object.
 *
 * @param {T} data - The input object to filter keys from.
 * @param {Key[]} keys - The keys to be excluded from the object.
 * @return {Omit<T, Key>} A new object with the specified keys excluded.
 */
export function Omit<T, Key extends keyof T>(
  data: T,
  keys: Key[],
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key as Key)),
  ) as Omit<T, Key>;
}

/**
 * Picks specific keys from the input object 'data' and returns a new object with only those keys.
 *
 * @param {T} data - The input object to pick keys from.
 * @param {Key[]} keys - The keys to be picked from the object.
 * @return {Pick<T, Key>} A new object with only the specified keys picked.
 */
export function Pick<T, Key extends keyof T>(
  data: T,
  keys: Key[],
): Pick<T, Key> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => keys.includes(key as Key)),
  ) as Pick<T, Key>;
}

/**
 * Maps over an array of objects and picks specific keys to create a new array of objects.
 *
 * @param {T[]} dataArray - The array of objects to pick from.
 * @param {K[]} keys - The keys to pick from each object.
 * @return {Pick<T, K>[]} An array of objects with only the specified keys picked.
 */
export function PickObjects<T, K extends keyof T>(
  dataArray: T[],
  keys: K[],
): Pick<T, K>[] {
  return dataArray
    .map((obj) => {
      const newObj: Partial<Pick<T, K>> = {};
      keys.forEach((key) => {
        if (obj[key] !== undefined) {
          newObj[key] = obj[key];
        }
      });
      return newObj as Pick<T, K>;
    })
    .filter((obj) => Object.keys(obj).length > 0); // Filter out objects with no properties
}

/**
 * Maps over an array of objects and excludes specific keys to create a new array of objects.
 *
 * @param {T[]} dataArray - The array of objects to exclude keys from.
 * @param {K[]} keys - The keys to exclude from each object.
 * @return {Omit<T, K>[]} An array of objects with the specified keys excluded.
 */
export function OmitObjects<T, K extends keyof T>(
  dataArray: T[],
  keys: K[],
): Omit<T, K>[] {
  return dataArray.map((obj) => {
    const newObj: Partial<Omit<T, K>> = {};
    Object.keys(obj).forEach((key) => {
      if (!keys.includes(key as K)) {
        newObj[key as keyof Omit<T, K>] = obj[key as keyof Omit<T, K>];
      }
    });
    return newObj as Omit<T, K>;
  });
}

/**
 * Renames keys in the input object based on a mapping and returns a new object.
 *
 * @param {T} data - The input object to rename keys.
 * @param {Record<Key, NewKey>} keyMap - An object mapping old keys to new keys.
 * @return {Record<NewKey, T[Key]>} A new object with renamed keys.
 */
export function RenameKeys<T, Key extends keyof T, NewKey extends string>(
  data: T,
  keyMap: Record<Key, NewKey>,
): Record<NewKey, T[Key]> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      keyMap[key as Key] || key,
      value,
    ]),
  ) as Record<NewKey, T[Key]>;
}

/**
 * Filters an array of objects based on a predicate function.
 *
 * @param {T[]} dataArray - The array of objects to filter.
 * @param {(obj: T) => boolean} predicate - A function to test each object.
 * @return {T[]} A new array with objects that satisfy the predicate.
 */
export function FilterObjects<T>(
  dataArray: T[],
  predicate: (obj: T) => boolean,
): T[] {
  return dataArray.filter(predicate);
}

/**
 * Merges multiple objects into one.
 *
 * @param {...Partial<T>[]} objects - Objects to merge.
 * @return {T} A new object with merged properties.
 */
export function MergeObjects<T>(...objects: Partial<T>[]): T {
  return Object.assign({}, ...objects);
}

/**
 * Sorts an array of objects by a specified key.
 *
 * @param {T[]} dataArray - The array of objects to sort.
 * @param {K} key - The key to sort objects by.
 * @param {'asc' | 'desc'} [order='asc'] - The order to sort ('asc' or 'desc').
 * @return {T[]} A new sorted array of objects.
 */
export function SortObjectsByKey<T, K extends keyof T>(
  dataArray: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  return [...dataArray].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Flattens a nested object into a single-level object with dot-separated keys.
 *
 * @param {Record<string, any>} obj - The nested object to flatten.
 * @param {string} [parentKey=''] - Used internally for recursion to track key prefixes.
 * @return {Record<string, any>} The flattened object.
 */
export function FlattenObject(
  obj: Record<string, any>,
  parentKey = '',
): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.assign(acc, FlattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

/**
 * Unflattens an object with dot-separated keys into a nested object.
 *
 * @param {Record<string, any>} obj - The flattened object to unflatten.
 * @return {Record<string, any>} The nested object.
 */
export function UnflattenObject(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      key.split('.').reduce((nested, part, index, parts) => {
        if (index === parts.length - 1) {
          nested[part] = value;
        } else {
          nested[part] = nested[part] || {};
        }
        return nested[part];
      }, acc);
      return acc;
    },
    {} as Record<string, any>,
  );
}
