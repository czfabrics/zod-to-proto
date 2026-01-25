export type GetNewParams<T> = Omit<
    T,
    'internalName' | 'getDeepMessages' | 'getDeepImportedTypes' | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    'getDeepMessages' | 'getDeepImportedTypes' | 'getNextIndex'
>
