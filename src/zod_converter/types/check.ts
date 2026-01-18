import type { ArrayToStringDisplay, CheckTuple } from '#core/types/check_tuple'
import type { TuplifyUnion } from '#core/types/tuplify_union'
import type { TypeDebuggingError } from '#core/types/type_debugging_error'
import type { ZodOneOfUnion } from '#zod/types/zod_one_of_union'
import type {
    ExcludeZodType,
    IntoSomeZodType,
    SomeZodArray,
    SomeZodIntersection,
    SomeZodObject,
    SomeZodPassthrough,
    SomeZodRecord,
    SomeZodSet,
    SomeZodShape,
    SomeZodType,
    SomeZodUnion,
} from '#zod_converter/types/some_type'
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
    type ZodIntersection,
    type ZodLazy,
    type ZodLiteral,
    type ZodNonOptional,
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
import type { $ZodTypeDiscriminable, SomeType } from 'zod/v4/core'

type ZodChildRecordIntoTuple<TChildRecord extends SomeZodShape> = TuplifyUnion<
    TChildRecord[keyof TChildRecord]
>

export type ZodCompatibleType =
    | ZodCategoryNoChild
    | ZodCategoryChildRecord
    | ZodCategoryChildArray
    | ZodCategoryOneChild
    | ZodCategoryTwoChildren

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

export type CheckZodTypeCompatibility<TZodType extends SomeType> =
    GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCompatibleType>
        ? TZodType
        : never

export type ZodCategoryNoChild =
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

export type ZodCategoryPassthrough<TChild extends SomeType = SomeType> =
    | ZodCatch<TChild>
    | ZodOptional<TChild>
    | ZodNonOptional<TChild>
    | ZodReadonly<TChild>
    | ZodDefault<TChild>
    | ZodPrefault<TChild>
    | ZodLazy<TChild>
    //// We consider `ZodPipe` to have one child because we don’t care about the output type.
    | ZodPipe<TChild>
    //// We consider `ZodCodec` to have one child because we don’t care about the output type.
    | ZodCodec<TChild>

export type ZodCategoryOneChildWithoutPasstrough = ZodSet | ZodArray

export type ZodCategoryOneChild =
    | ZodCategoryOneChildWithoutPasstrough
    | ZodCategoryPassthrough
type GetChild<TZodType extends SomeType> =
    TZodType extends SomeZodSet<infer TChild>
        ? readonly [TChild]
        : TZodType extends SomeZodArray<infer TChild>
          ? readonly [TChild]
          : TZodType extends SomeZodPassthrough<infer TChild>
            ? readonly [TChild]
            : []

type ZodCategoryTwoChildren = ZodRecord | ZodIntersection
type GetTwoChildren<TZodType extends SomeType> =
    TZodType extends SomeZodRecord<infer TChild1, infer TChild2>
        ? readonly [TChild1, TChild2]
        : TZodType extends SomeZodIntersection<infer TChild1, infer TChild2>
          ? readonly [TChild1, TChild2]
          : []

type ZodCategoryChildRecord = ZodObject
type GetChildrenFromChildRecord<TZodType extends SomeType> =
    TZodType extends SomeZodObject<infer TChildRecord>
        ? readonly [...ZodChildRecordIntoTuple<TChildRecord>]
        : []

type ZodCategoryChildArray = ZodOneOfUnion
type GetChildrenFromChildArray<TZodType extends SomeType> =
    TZodType extends SomeZodUnion<infer TChildArray> ? TChildArray : []

type GetChildZodType<TZodType extends SomeType> =
    GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCategoryNoChild>
        ? []
        : GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCategoryOneChild>
          ? GetChild<TZodType>
          : GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCategoryChildRecord>
            ? GetChildrenFromChildRecord<TZodType>
            : GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCategoryChildArray>
              ? GetChildrenFromChildArray<TZodType>
              : GetZodTypeValue<TZodType> extends GetZodTypeValue<ZodCategoryTwoChildren>
                ? GetTwoChildren<TZodType>
                : []

type OneChildConditions = readonly [
    {
        parent: SomeZodType<'array'>
        childConditions: readonly [
            | IntoSomeZodType<ZodCategoryNoChild>
            | IntoSomeZodType<ZodCategoryOneChildWithoutPasstrough>
            | IntoSomeZodType<ZodCategoryChildRecord>
            | IntoSomeZodType<ExcludeZodType<ZodCategoryTwoChildren, 'record'>>,
        ]
        error: TypeDebuggingError<`${GetZodTypeValue<SomeZodType<'array'>>}'s children should be of these types '${ArrayToStringDisplay<
            TuplifyUnion<
                GetZodTypeValue<
                    | IntoSomeZodType<ZodCategoryNoChild>
                    | IntoSomeZodType<ZodCategoryOneChildWithoutPasstrough>
                    | IntoSomeZodType<ZodCategoryChildRecord>
                    | IntoSomeZodType<ExcludeZodType<ZodCategoryTwoChildren, 'record'>>
                >
            >
        >}'`>
    },
]

type TwoChildConditions = readonly [
    {
        parent: SomeZodType<'intersection'>
        childConditions: readonly [SomeZodObject, SomeZodObject]
        error: TypeDebuggingError<`${GetZodTypeValue<SomeZodType<'intersection'>>}'s children should be of this type '${GetZodTypeValue<SomeZodObject>}'`>
    },
    {
        parent: SomeZodType<'record'>
        childConditions: readonly [
            SomeZodType<any, string | number, string | number>,
            (
                | IntoSomeZodType<ZodCategoryNoChild>
                | IntoSomeZodType<ZodCategoryChildRecord>
                | IntoSomeZodType<ExcludeZodType<ZodCategoryTwoChildren, 'record'>>
            ),
        ]
        error: TypeDebuggingError<`${GetZodTypeValue<ZodRecord>}'s key should be of these types '${ArrayToStringDisplay<
            TuplifyUnion<GetZodTypeValue<SomeZodType<'string' | 'number'>>>
        >}', ${GetZodTypeValue<ZodRecord>}'s value should be of these types '${ArrayToStringDisplay<
            TuplifyUnion<
                GetZodTypeValue<
                    | IntoSomeZodType<ZodCategoryNoChild>
                    | IntoSomeZodType<ZodCategoryChildRecord>
                    | IntoSomeZodType<ExcludeZodType<ZodCategoryTwoChildren, 'record'>>
                >
            >
        >}'`>
    },
]

type ChildArrayConditions = readonly [
    {
        parent: SomeZodUnion
        childConditions: readonly [
            SomeZodObject<{ $case: ZodLiteral<string>; value: $ZodTypeDiscriminable }>,
        ]
        error: TypeDebuggingError<`You should use 'pz.oneOfUnion()' to make an union`>
    },
]

type ChildConditions = readonly [
    ...OneChildConditions,
    ...TwoChildConditions,
    ...ChildArrayConditions,
]

type GetChildConditions<
    TZodType extends SomeType,
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = ChildConditions['length'] extends TIndex
    ? []
    : GetZodTypeValue<TZodType> extends GetZodTypeValue<ChildConditions[TIndex]['parent']>
      ? ChildConditions[TIndex]['childConditions']
      : GetChildConditions<TZodType, [...TRawIndex, '+1']>

type GetChildConditionError<
    TZodType extends SomeType,
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = ChildConditions['length'] extends TIndex
    ? TypeDebuggingError<'No error'>
    : GetZodTypeValue<TZodType> extends GetZodTypeValue<ChildConditions[TIndex]['parent']>
      ? ChildConditions[TIndex]['error']
      : GetChildConditionError<TZodType, [...TRawIndex, '+1']>

type CheckChildConditions<
    TChildren extends readonly SomeType[],
    TChildConditions extends readonly SomeType[],
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = TChildren['length'] extends TIndex
    ? true
    : //// Avoid using `GetZodTypeValue` since the conditions need strict validation.
      TChildren[TIndex] extends TChildConditions[TIndex]
      ? CheckChildConditions<TChildren, TChildConditions, [...TRawIndex, '+1']>
      : false

type ContinueRecursiveForChildren<
    TRoot extends SomeType,
    TZodTypes extends readonly SomeType[],
    TRawIndex extends string[] = [],
    TIndex extends number = TRawIndex['length'],
> = TZodTypes['length'] extends TIndex
    ? TRoot
    : CheckZodSchemaCompatibility<TZodTypes[TIndex]> extends infer TResult extends
            TypeDebuggingError<string>
      ? TResult
      : ContinueRecursiveForChildren<TRoot, TZodTypes, [...TRawIndex, '+1']>

export type CheckZodSchemaCompatibility<
    TZodType extends SomeType,
    TChildren extends readonly SomeType[] = GetChildZodType<TZodType>,
    TChildConditions extends readonly SomeType[] = GetChildConditions<TZodType>,
    TChildConditionError extends TypeDebuggingError<string> =
        GetChildConditionError<TZodType>,
> =
    CheckZodTypeCompatibility<TZodType> extends never
        ? TypeDebuggingError<`This Zod type '${GetZodTypeValue<TZodType>}' is not supported`>
        : TChildConditions['length'] extends 0
          ? TChildren['length'] extends 0
              ? TZodType
              : ContinueRecursiveForChildren<TZodType, TChildren>
          : CheckChildConditions<TChildren, TChildConditions> extends true
            ? ContinueRecursiveForChildren<TZodType, TChildren>
            : TChildConditionError

// export function cliArgument<const TInner extends $ZodType>(
//     innerType: CheckZodSchemaCompatibility<TInner>
// ): void {}

// TODO: poubelle
// const schema = z.intersection(z.object({ d: z.string() }), z.object({ d2: z.string() }))
// const schema = z.intersection(z.string(), z.string())
// const schema = pz.oneOfUnion([['test', z.object()]])
// const schema = z.union([z.object({ t2: z.string() }), z.object({ t: z.string() })])
// const schema = z.record(z.string(), z.array(z.string()))
// const schema = z.record(z.string(), z.number())
// const schema = z.string().nullable()
// const schema = z.array(z.string())
// const schema = z.object({
//     hihi: z.array(z.string()),
// })
// const schema = z.object({ test: z.string() })

// type TCHildren = GetChildZodType<typeof schema>
// type TCond = GetChildConditions<typeof schema>
// type TresultChekc = CheckChildConditions<TCHildren, TCond>

// cliArgument(schema)
// type child = GetChildZodType<Schema>

// type allo22 = ContinueRecursiveForArray<[ZodAny]>
// type inter = inferCorrectZod<child>
