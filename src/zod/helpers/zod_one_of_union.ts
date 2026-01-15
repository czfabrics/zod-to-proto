import { assertsNotEmptyArray } from '#core/asserts/not_empty_array'
import { ZodOneOfUnion } from '#zod/types/zod_one_of_union'
import z, { ZodDiscriminatedUnion, ZodLiteral, ZodObject } from 'zod'
import type { $ZodTypeDiscriminable } from 'zod/v4/core'

type OneOfCase = [string, $ZodTypeDiscriminable]

type OneOfCasesIntoUnionOptions<
    TCases extends [OneOfCase, ...OneOfCase[]],
    TAccumulatedOptions extends ZodObject[] = [],
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = TCases['length'] extends TIndex
    ? TAccumulatedOptions
    : OneOfCasesIntoUnionOptions<
          TCases,
          [
              ...TAccumulatedOptions,
              ZodObject<{
                  $case: ZodLiteral<TCases[TIndex][0]>
                  value: TCases[TIndex][1]
              }>,
          ],
          ['+1', ...TRawIndex]
      >

export const oneOfUnion = function <const TCases extends [OneOfCase, ...OneOfCase[]]>(
    cases: TCases
): ZodOneOfUnion<OneOfCasesIntoUnionOptions<TCases>> {
    const unionOptions = cases.map(([caseName, object]) => {
        return z.object({ $case: z.literal(caseName), value: object })
    })

    assertsNotEmptyArray(unionOptions)

    return z.discriminatedUnion('$case', unionOptions) as ZodDiscriminatedUnion<
        OneOfCasesIntoUnionOptions<TCases>,
        '$case'
    >
}

export const pz = {
    oneOfUnion,
}
