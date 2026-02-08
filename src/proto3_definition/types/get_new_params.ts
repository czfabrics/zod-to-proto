export type GetNewParams<T> = Omit<
    T,
    | 'id'
    | 'internalName'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'applyTypePrefix'
    | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    'id' | 'getDeepMessages' | 'getDeepImportedTypes' | 'applyTypePrefix' | 'getNextIndex'
>
