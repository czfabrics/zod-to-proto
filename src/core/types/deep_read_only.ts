export type DeepReadOnly<T> = T extends object
    ? { readonly [K in keyof T]: DeepReadOnly<T[K]> }
    : T
