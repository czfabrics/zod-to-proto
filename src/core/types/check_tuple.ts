import type { TuplifyUnion } from '#core/types/tuplify_union'
import type { TypeDebuggingError } from '#core/types/type_debugging_error'

export type CheckTuple<
    TUnion extends string,
    TValues extends string[],
> = TValues[number] extends TUnion
    ? TValues['length'] extends TuplifyUnion<TUnion>['length']
        ? TValues
        : TypeDebuggingError<`Missing values: ${ArrayToStringDisplay<TuplifyUnion<Exclude<TUnion, TValues[number]>>>}`>
    : TypeDebuggingError<`Unexpected values: ${ArrayToStringDisplay<RemoveFromArray<TValues, TUnion>>}`>

type ArrayToStringDisplay<
    TValues extends unknown[],
    TDisplay extends string = '[',
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = TValues['length'] extends TIndex
    ? `${TDisplay}]`
    : TValues[TIndex] extends string
      ? TDisplay extends '['
          ? ArrayToStringDisplay<
                TValues,
                `${TDisplay}${TValues[TIndex]}`,
                ['+1', ...TRawIndex]
            >
          : ArrayToStringDisplay<
                TValues,
                `${TDisplay},${TValues[TIndex]}`,
                ['+1', ...TRawIndex]
            >
      : never

type RemoveFromArray<TValues extends string[], TUnion extends string> = TValues extends [
    infer TFirst,
    ...infer TRest,
]
    ? TFirst extends TUnion
        ? TRest extends string[]
            ? RemoveFromArray<TRest, TUnion>
            : never
        : TRest extends string[]
          ? [TFirst, ...RemoveFromArray<TRest, TUnion>]
          : never
    : TValues
