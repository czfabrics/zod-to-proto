/**
 * @deprecated (not deprecated) DO NOT USE inside a proto definition,
 * as it breaks the TypeScript compiler due to clone method issues,
 * which in turn breaks aliases and generates numerous inferred readonly types.
 * TS error: TS7056
 * Issue: https://github.com/colinhacks/zod/issues/1040
 */
export type DeepReadOnly<T> = T extends object
    ? {
          readonly [TKey in keyof T]: T[TKey] extends (
              ...args: infer TArgs
          ) => infer TReturn
              ? (...args: TArgs) => DeepReadOnly<TReturn>
              : DeepReadOnly<T[TKey]>
      }
    : T

export type ReadOnly<T> = T extends object
    ? {
          readonly [TKey in keyof T]: T[TKey]
      }
    : T
