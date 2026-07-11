import type { CheckTuple } from '#core/types/check_tuple'
import type { Prettify } from '#core/types/prettify'
import type { ZodOneOfUnion } from '#zod/types/zod_one_of_union'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import type { ZodDynamicSizeType } from '#zod_converter/types/dynamic_size'
import {
    type AnyZodPassthroughInner,
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ZodScalarType } from '#zod_converter/types/scalars'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import type { ZodEnum, ZodObject } from 'zod'
import type { SomeType } from 'zod/v4/core'

export type AnyZodMessage = ZodObject | ZodEnum

export type AnyZodMessageTypeValue = Prettify<GetZodTypeValue<AnyZodMessage>>
export type AnyZodMessageTypeTuple = AnyZodMessageTypeValue[]

export const AnyZodMessageTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<AnyZodMessageTypeValue, TValues>
    ): AnyZodMessageTypeTuple {
        return values as AnyZodMessageTypeTuple
    },
    get: (): AnyZodMessageTypeTuple => {
        return AnyZodMessageTypeTuple.new(['object', 'enum'])
    },
} as const

export const AnyZodMessage = {
    is: function (
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<AnyZodMessage> {
        const deepSchema = ZodPassthroughType.pass(context.direction, schema)

        const zodTypes: string[] = AnyZodMessageTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const

export type ZodMessageFieldType = ZodScalarType | ZodDynamicSizeType | AnyZodMessage
export type ZodMessageFieldTypeValue = GetZodTypeValue<ZodMessageFieldType>
export type ZodMessageFieldTypeTuple = ZodMessageFieldTypeValue[]

export const ZodMessageFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodMessageFieldTypeValue, TValues>
    ): ZodMessageFieldTypeTuple {
        return values as ZodMessageFieldTypeTuple
    },
    get: (): ZodMessageFieldTypeTuple => {
        return ZodMessageFieldTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'array',
            'set',
            'record',
            'object',
            'enum',
        ])
    },
} as const

export const ZodMessageFieldType = {
    is: function (
        context: ZodConversionContext,
        schema: SomeType
    ): schema is WithMaybeZodPassthrough<ZodMessageFieldType> {
        const deepSchema = ZodPassthroughType.pass(context.direction, schema)

        const zodTypes: string[] = ZodMessageFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const

export type ZodMessageOneOfFieldType = ZodOneOfUnion
export type ZodMessageOneOfFieldTypeValue = Prettify<
    GetZodTypeValue<ZodMessageOneOfFieldType>
>
export type ZodMessageOneOfFieldTypeTuple = ZodMessageOneOfFieldTypeValue[]

export const ZodMessageOneOfFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodMessageOneOfFieldTypeValue, TValues>
    ): ZodMessageOneOfFieldTypeTuple {
        return values as ZodMessageOneOfFieldTypeTuple
    },
    get: (): ZodMessageOneOfFieldTypeTuple => {
        return ZodMessageOneOfFieldTypeTuple.new(['union'])
    },
} as const

export const ZodMessageOneOfFieldType = {
    is: function (
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<ZodMessageOneOfFieldType> {
        const deepSchema = ZodPassthroughType.pass(context.direction, schema)

        const zodTypes: string[] = ZodMessageOneOfFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const

export type AnyZodMessageFieldType = ZodMessageFieldType | ZodMessageOneOfFieldType
export type AnyZodMessageFieldTypeValue = GetZodTypeValue<AnyZodMessageFieldType>
export type AnyZodMessageFieldTypeTuple = AnyZodMessageFieldTypeValue[]

export const AnyZodMessageFieldTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<AnyZodMessageFieldTypeValue, TValues>
    ): AnyZodMessageFieldTypeTuple {
        return values as AnyZodMessageFieldTypeTuple
    },
    get: (): AnyZodMessageFieldTypeTuple => {
        return AnyZodMessageFieldTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'array',
            'set',
            'record',
            'object',
            'enum',
            'union',
        ])
    },
} as const

export const AnyZodMessageFieldType = {
    is: function (
        context: ZodConversionContext,
        schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
    ): schema is WithMaybeZodPassthrough<AnyZodMessageFieldType> {
        const deepSchema = ZodPassthroughType.pass(context.direction, schema)

        const zodTypes: string[] = AnyZodMessageFieldTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const
