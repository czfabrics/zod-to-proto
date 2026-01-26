export type GetNewParams<T> = Omit<
    T,
    | 'internalName'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'applyTypePrefix'
    | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    'getDeepMessages' | 'getDeepImportedTypes' | 'applyTypePrefix' | 'getNextIndex'
>
