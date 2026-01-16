import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import type {
    ZodTypeCategoryOneChild,
    ZodTypeCategoryTwoChildrenCasseCouille,
} from '#zod_converter/types/check'
import { AnyZodMessage } from '#zod_converter/types/messages'
import {
    AnyZodPassthroughInner,
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import { ZodPrimitifType } from '#zod_converter/types/primitifs'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodComplexPrimitifType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodComplexPrimitifTypeTuple.new([
            'array',
            'set',
            'record',
        ])

        return zodTypes.includes(deepSchema._zod.def.type)
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodRepeatedInnerType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodRepeatedInnerTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
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
    is: function (
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodMapValueType> {
        const deepSchema = ZodPassthroughType.pass(schema)

        const zodTypes: string[] = ZodMapValueTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const
