export type Prettify<T> = {
    [TKey in keyof T]: T[TKey]
} & {}
