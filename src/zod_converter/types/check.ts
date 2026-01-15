import type { CheckTuple } from '#core/types/check_tuple'
import type { GetFirstInUnion } from '#core/types/tuplify_union'
import type { TypeDebuggingError } from '#core/types/type_debugging_error'
import type { ZodOneOfUnion } from '#zod/types/zod_one_of_union'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import {
    type ZodArray,
    type ZodBigInt,
    type ZodBigIntFormat,
    type ZodBoolean,
    type ZodCatch,
    type ZodCodec,
    type ZodDefault,
    type ZodEnum,
    type ZodFile,
    type ZodIntersection,
    type ZodLazy,
    type ZodLiteral,
    type ZodNonOptional,
    type ZodNullable,
    type ZodNumber,
    type ZodNumberFormat,
    type ZodObject,
    type ZodOptional,
    type ZodPipe,
    type ZodPrefault,
    type ZodReadonly,
    type ZodRecord,
    type ZodSet,
    type ZodString,
    type ZodStringFormat,
    type ZodTemplateLiteral,
} from 'zod'
import type {
    $ZodRecordKey,
    $ZodType,
    $ZodTypeDiscriminable,
    SomeType,
} from 'zod/v4/core'

export type ZodCompatibleType =
    | ZodTypeCategoryNoChild
    | ZodTypeCategoryChildRecord
    | ZodTypeCategoryChildArrayCasseCouille
    | ZodTypeCategoryTwoChildren
    | ZodTypeCategoryTwoChildrenCasseCouille
    | ZodTypeCategoryOneChild
    | ZodTypeCategoryPassthrough

export type CompatibleZodTypeValue = GetZodTypeValue<ZodCompatibleType>
export type CompatibleZodTypeTuple = CompatibleZodTypeValue[]

export const CompatibleZodTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<CompatibleZodTypeValue, TValues>
    ): CompatibleZodTypeTuple {
        return values as CompatibleZodTypeTuple
    },
    get: (): CompatibleZodTypeTuple => {
        return CompatibleZodTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'object',
            'literal',
            'template_literal',
            'enum',
            'file',
            'union',
            'pipe',
            'default',
            'prefault',
            'lazy',
            'intersection',
            'record',
            'catch',
            'optional',
            'nonoptional',
            'nullable',
            'readonly',
            'set',
            'array',
        ])
    },
} as const

export const ZodCompatibleType = {
    is: (schema: SomeType): schema is ZodCompatibleType => {
        const zodTypes: CompatibleZodTypeTuple = CompatibleZodTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type ZodTypeCategoryNoChild =
    | ZodString
    | ZodStringFormat
    | ZodLiteral
    | ZodTemplateLiteral
    | ZodEnum
    | ZodNumber
    | ZodNumberFormat
    | ZodBigInt
    | ZodBigIntFormat
    | ZodBoolean
    | ZodFile

export type ZodChildRecord = {
    [key: string]: $ZodType
}

/**
 * **WARNING:** `$ZodType[]` instead of `readonly SomeType[]` DIDN'T WORK, IT NEEDS THE TRUE TYPE USED BY ZOD
 */
export type ZodChildArray<TInnerType extends SomeType = SomeType> = readonly TInnerType[]

export type ZodTypeCategoryChildRecord<
    TChildRecord extends ZodChildRecord = ZodChildRecord,
> = ZodObject<TChildRecord>

type PassthroughZodTypeCategoryChildRecord<
    TZodType extends SomeType,
    TChildRecord extends ZodChildRecord,
> = TZodType extends ZodTypeCategoryChildRecord<TChildRecord> ? TZodType : never

export type ZodTypeCategoryTwoChildren<
    TChild1 extends SomeType = SomeType,
    TChild2 extends SomeType = SomeType,
> =
    | ZodPipe<TChild1, TChild2>
    | ZodCodec<TChild1, TChild2>
    | ZodIntersection<TChild1, TChild2>

export type ZodTypeCategoryTwoChildrenCasseCouille<
    TChild1 extends $ZodRecordKey = $ZodRecordKey,
    TChild2 extends SomeType = SomeType,
> = ZodRecord<TChild1, TChild2>

type PassthroughZodTypeCategoryTwoChildren<
    TZodType extends SomeType,
    TChild1 extends SomeType,
    TChild2 extends SomeType,
> = TChild1 extends $ZodRecordKey
    ? TZodType extends ZodTypeCategoryTwoChildrenCasseCouille<TChild1, TChild2>
        ? TZodType
        : TZodType extends ZodTypeCategoryTwoChildren<TChild1, TChild2>
          ? TZodType
          : never
    : TZodType extends ZodTypeCategoryTwoChildren<TChild1, TChild2>
      ? TZodType
      : never

export type ZodTypeCategoryChildArrayCasseCouille<
    TChildArray extends ZodChildArray<
        ZodObject<{ $case: ZodLiteral<string>; value: $ZodTypeDiscriminable }>
    > = ZodChildArray<
        ZodObject<{ $case: ZodLiteral<string>; value: $ZodTypeDiscriminable }>
    >,
> = ZodOneOfUnion<TChildArray>

type PassthroughZodTypeCategoryChildArray<
    TZodType extends SomeType,
    TChildArray extends ZodChildArray,
> =
    TChildArray extends ZodChildArray<
        ZodObject<{ $case: ZodLiteral<string>; value: $ZodTypeDiscriminable }>
    >
        ? TZodType extends ZodTypeCategoryChildArrayCasseCouille<TChildArray>
            ? TZodType
            : never
        : never

export type ZodTypeCategoryOneChild<TChild extends SomeType = SomeType> =
    | ZodSet<TChild>
    | ZodArray<TChild>

export type ZodTypeCategoryPassthrough<TChild extends SomeType = SomeType> =
    | ZodCatch<TChild>
    | ZodOptional<TChild>
    | ZodNonOptional<TChild>
    | ZodNullable<TChild>
    | ZodReadonly<TChild>
    | ZodDefault<TChild>
    | ZodPrefault<TChild>
    | ZodLazy<TChild>

type PassthroughZodTypeCategoryOneChild<
    TZodType extends SomeType,
    TChild extends $ZodType,
> =
    TZodType extends ZodTypeCategoryOneChild<TChild>
        ? TZodType
        : TZodType extends ZodTypeCategoryPassthrough<TChild>
          ? TZodType
          : never

// TODO: à voir pour le remettre...
// type PassthroughZodType<
//     TZodTypeValue extends $ZodTypeDef['type'],
//     TChild1 extends $ZodType,
//     TChild2 extends $ZodType,
//     TChildRecord extends Test,
//     TChildArray extends Test2,
// > =
//     PassthroughZodTypeCategory1<TZodTypeValue, TChildRecord> extends infer T
//         ? T
//         : PassthroughZodTypeCategory2<TZodTypeValue, TChild1, TChild2> extends infer T
//           ? T
//           : PassthroughZodTypeCategory2_5<TZodTypeValue, TChildArray> extends infer T
//             ? T
//             : PassthroughZodTypeCategory3<TZodTypeValue, TChild1> extends infer T
//               ? T
//               : never

type ContinueRecursiveRecord<TChildRecord extends ZodChildRecord> = {
    [TKey in keyof TChildRecord]: CheckZodSchemaCompatibility<TChildRecord[TKey]>
}

type ContinueRecursiveRecordDebug<TChildRecord extends ZodChildRecord> = GetFirstInUnion<
    {
        [TKey in keyof TChildRecord]: TChildRecord[TKey] extends CheckZodSchemaCompatibility<
            TChildRecord[TKey]
        >
            ? never
            : CheckZodSchemaCompatibility<TChildRecord[TKey]>
    }[keyof TChildRecord]
>

type ContinueRecursiveArray<TChildArray extends ZodChildArray> = {
    [TKey in keyof TChildArray]: CheckZodSchemaCompatibility<TChildArray[TKey]>
}

type ContinueRecursiveArrayDebug<TChildArray extends ZodChildArray> = GetFirstInUnion<
    {
        [TKey in keyof TChildArray]: TChildArray[TKey] extends CheckZodSchemaCompatibility<
            TChildArray[TKey]
        >
            ? never
            : CheckZodSchemaCompatibility<TChildArray[TKey]>
    }[number]
>

type ContinueRecursiveOneChild<TChild extends SomeType> =
    TChild extends CheckZodSchemaCompatibility<TChild> ? TChild : never

type ContinueRecursiveOneChildDebug<TChild extends SomeType> =
    TChild extends CheckZodSchemaCompatibility<TChild>
        ? never
        : CheckZodSchemaCompatibility<TChild>

// TODO: optimize to use GetZodTypeValue to increase performance check
export type CheckZodSchemaCompatibility<TZodType extends SomeType> =
    TZodType extends ZodTypeCategoryNoChild
        ? TZodType
        : TZodType extends PassthroughZodTypeCategoryChildRecord<
                TZodType,
                infer TChildRecord
            >
          ? TChildRecord extends ContinueRecursiveRecord<TChildRecord>
              ? TZodType
              : ContinueRecursiveRecordDebug<TChildRecord>
          : TZodType extends PassthroughZodTypeCategoryTwoChildren<
                  TZodType,
                  infer TChild1,
                  infer TChild2
              >
            ? TChild1 extends ContinueRecursiveOneChild<TChild1>
                ? TChild2 extends ContinueRecursiveOneChild<TChild2>
                    ? TZodType
                    : ContinueRecursiveOneChildDebug<TChild2>
                : ContinueRecursiveOneChildDebug<TChild1>
            : TZodType extends PassthroughZodTypeCategoryChildArray<
                    TZodType,
                    infer TChildArray
                >
              ? TChildArray extends ContinueRecursiveArray<TChildArray>
                  ? TZodType
                  : ContinueRecursiveArrayDebug<TChildArray>
              : TZodType extends PassthroughZodTypeCategoryOneChild<
                      TZodType,
                      infer TChild
                  >
                ? TChild extends ContinueRecursiveOneChild<TChild>
                    ? TZodType
                    : ContinueRecursiveOneChildDebug<TChild>
                : TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>

// TODO: remove
// export function cliArgument<const TInner extends $ZodType>(
//     innerType: CheckZodSchemaCompatibility<TInner>
// ): void {}

// cliArgument(
//     z.object({
//         test: z.string(), //.catch(''),
//         scope2: z.union([
//             z.object({
//                 name: z.literal('OFFICE_USER'),
//                 // name: z.string(),
//             }),
//             z.object({
//                 name: z.literal('PARTNERSHIP'),
//                 // name: z.string(),
//             }),
//         ]),
//         // test2: z.unknown(),
//         // test3: z.any(),
//     })
// )

// cliArgument(z.intersection(z.string(), z.boolean()))
// cliArgument(z.union([z.string(), z.boolean()]))
// cliArgument(z.union([z.string().optional(), z.string()]))
// cliArgument(
//     z.object({
//         test: z.union([z.string().optional()]),
//         test3: z.number(),
//     })
// )
// cliArgument(z.string().catch(''))
// cliArgument(z.record(z.string(), z.boolean()))
// cliArgument(
//     z.object({
//         test: z.union([z.string().optional()]),
//         test3: z.record(z.string(), z.boolean()),
//         test4: z.record(z.string(), z.boolean()),
//     })
// )
// cliArgument(z.set(z.string()))
// cliArgument(z.array(z.string()))

// cliArgument(
//     z.object({
//         test: z.set(z.string()),
//         test3: z.array(z.string()),
//         // test4: z.array(z.any()),
//     })
// )
