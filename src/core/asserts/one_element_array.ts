type AssertsOneElementArrayFn = <T>(array: T[]) => asserts array is [T, ...T[]]

export const assertsOneElementArray: AssertsOneElementArrayFn = function <T>(
    array: T[]
): asserts array is [T] {
    if (array.length !== 1) {
        throw new Error('Array should have one element only')
    }
}
