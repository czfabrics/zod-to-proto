export type PurgeUndefinedValues<TObject> = {
    [TKey in keyof TObject]: TObject[TKey] extends undefined ? never : TObject[TKey]
}
