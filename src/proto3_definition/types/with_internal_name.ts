export type WithInternalName<
    TObject extends { [key: string]: unknown },
    TKey extends keyof TObject,
> = {
    internalName: TKey extends string ? Lowercase<TKey> : never
} & TObject[TKey]
