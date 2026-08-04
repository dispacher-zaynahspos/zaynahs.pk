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
