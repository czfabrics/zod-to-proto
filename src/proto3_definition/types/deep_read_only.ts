export type DeepReadOnly<T> = T extends object
    ? {
          readonly [TKey in keyof T]: T[TKey] extends (
              ...args: infer TArgs
          ) => infer TReturn
              ? (...args: TArgs) => DeepReadOnly<TReturn>
              : DeepReadOnly<T[TKey]>
      }
    : T
