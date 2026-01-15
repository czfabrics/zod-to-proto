type AssertsNotEmptyArrayFn = <T>(array: T[]) => asserts array is [T, ...T[]]

export const assertsNotEmptyArray: AssertsNotEmptyArrayFn = function <T>(
    array: T[]
): asserts array is [T, ...T[]] {
    if (array.length === 0) {
        throw new Error('Array should have one element minimum')
    }
}
