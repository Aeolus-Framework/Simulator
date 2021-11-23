/**
 * Get the sum all numbers in an array of numbers.
 * @example
 * var x = [1, 1, 3, 3];
 * x.reduce(sum); // return 8
 *
 * @see `callbackfn` in `Array.prototype.reduce()` for parameter usage.
 *
 * @returns The sum all numbers in an array of numbers.
 */
export function sum(previousValue: number, currentValue: number): number {
    return previousValue + currentValue;
}

/**
 * Get the mean value of an array of numbers.
 *
 * @example
 * var x = [1, 1, 3, 3];
 * x.reduce(mean, 0); // return 2
 *
 * @see `callbackfn` in `Array.prototype.reduce()` for parameter usage.
 *
 * @returns The mean value of an array of numbers.
 */
export function mean(average: number, currentValue: number, currentIndex: number, array: number[]): number {
    return average + currentValue / array.length;
}
