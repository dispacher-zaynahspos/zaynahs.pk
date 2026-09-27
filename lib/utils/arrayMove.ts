/**
 * Moves an item in an array from one index to another.
 * Returns a new array with the item moved.
 */
export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return arr;
  const newArr = [...arr];
  const [moved] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, moved);
  return newArr;
}

/**
 * Move an item one position up or down (adjacent swap), returning a NEW array.
 * Out-of-range moves return the original array unchanged.
 *
 * SINGLE SOURCE for the "reorder up/down" logic that was duplicated verbatim
 * across the customizer list editors (hero slides, category/collections grid
 * cards, etc.). Use this instead of re-writing the temp-swap each time.
 */
export function moveItemInArray<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= arr.length || target < 0 || target >= arr.length) {
    return arr;
  }
  const copy = [...arr];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}
