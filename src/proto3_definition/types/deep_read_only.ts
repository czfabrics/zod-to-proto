export type DeepReadOnly<T> = T extends object
    ? {
          readonly [TKey in keyof T]: T[TKey] extends () => infer TReturn
              ? () => DeepReadOnly<TReturn>
              : DeepReadOnly<T[TKey]>
      }
    : T
