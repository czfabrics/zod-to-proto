export type GetNewParams<T> = Omit<
    T,
    | 'id'
    | 'internalName'
    | 'clone'
    | 'addPrefix'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'applyTypePrefix'
    | 'getNextIndex'
>

export type GetAnyNewParams<T> = Omit<
    T,
    | 'id'
    | 'clone'
    | 'addPrefix'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'applyTypePrefix'
    | 'getNextIndex'
>
