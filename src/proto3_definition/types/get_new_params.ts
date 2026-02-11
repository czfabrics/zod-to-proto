export type GetNewParams<T> = Omit<
    T,
    | 'id'
    | 'internalName'
    | 'clone'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    | 'id'
    | 'clone'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getNextIndex'
>
