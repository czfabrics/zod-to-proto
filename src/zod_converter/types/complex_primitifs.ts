import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import type {
    ZodTypeCategoryOneChild,
    ZodTypeCategoryTwoChildrenCasseCouille,
} from '#zod_converter/types/check'
import { AnyZodMessage } from '#zod_converter/types/messages'
import { ZodPrimitifType } from '#zod_converter/types/primitifs'
import type {
    CastZodTypeFromTypeValue,
    GetZodTypeValue,
} from '#zod_converter/types/zod_type_value'
import type { ZodRecord } from 'zod'
import type { $ZodRecordKey, SomeType } from 'zod/v4/core'

export type ZodComplexPrimitifType =
    | ZodTypeCategoryOneChild
    | ZodTypeCategoryTwoChildrenCasseCouille<$ZodRecordKey>

export type ZodComplexPrimitifTypeValue = Prettify<
    GetZodTypeValue<ZodComplexPrimitifType>
>
export type ZodComplexPrimitifTypeTuple = ZodComplexPrimitifTypeValue[]

export const ZodComplexPrimitifTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodComplexPrimitifTypeValue, TValues>
    ): ZodComplexPrimitifTypeTuple {
        return values as ZodComplexPrimitifTypeTuple
    },
} as const

export const ZodComplexPrimitifType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodComplexPrimitifType> => {
        const zodTypes: ZodComplexPrimitifTypeTuple = ZodComplexPrimitifTypeTuple.new([
            'array',
            'set',
            'record',
        ])

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type ZodRepeatedInnerType =
    | ZodPrimitifType
    | Exclude<ZodComplexPrimitifType, ZodRecord<$ZodRecordKey, SomeType>>
    | AnyZodMessage

export type ZodRepeatedInnerTypeValue = GetZodTypeValue<ZodRepeatedInnerType>
export type ZodRepeatedInnerTypeTuple = ZodRepeatedInnerTypeValue[]

export const ZodRepeatedInnerTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodRepeatedInnerTypeValue, TValues>
    ): ZodRepeatedInnerTypeTuple {
        return values as ZodRepeatedInnerTypeTuple
    },
    get: (): ZodRepeatedInnerTypeTuple => {
        return ZodRepeatedInnerTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'file',
            'object',
            'enum',
            'set',
            'array',
        ])
    },
} as const

export const ZodRepeatedInnerType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodRepeatedInnerType> => {
        const zodTypes: ZodRepeatedInnerTypeTuple = ZodRepeatedInnerTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const

export type ZodMapValueType = ZodPrimitifType | AnyZodMessage
export type ZodMapValueTypeValue = GetZodTypeValue<ZodMapValueType>
export type ZodMapValueTypeTuple = ZodMapValueTypeValue[]

export const ZodMapValueTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodMapValueTypeValue, TValues>
    ): ZodMapValueTypeTuple {
        return values as ZodMapValueTypeTuple
    },
    get: (): ZodMapValueTypeTuple => {
        return ZodMapValueTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'file',
            'object',
            'enum',
        ])
    },
} as const

export const ZodMapValueType = {
    is: <TSchema extends SomeType>(
        schema: TSchema
        // @ts-expect-error TS compiler doesn't like this type CastZodTypeFromTypeValue but it works...
    ): schema is CastZodTypeFromTypeValue<TSchema, ZodMapValueType> => {
        const zodTypes: ZodMapValueTypeTuple = ZodMapValueTypeTuple.get()

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const
