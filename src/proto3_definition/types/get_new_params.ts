export type GetNewParams<T> = Omit<
    T,
    | 'internalName'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getDeepOptionalMessageFields'
    | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getDeepOptionalMessageFields'
    | 'getNextIndex'
>
