import type { CheckTuple } from '#core/types/check_tuple'
import type { ZodCategoryNoChild } from '#zod_converter/types/check'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import {
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import type { ZodEnum } from 'zod'
import type { SomeType } from 'zod/v4/core'

export type ZodScalarType = Exclude<ZodCategoryNoChild, ZodEnum>

export type ZodScalarTypeValue = GetZodTypeValue<ZodScalarType>
export type ZodScalarTypeTuple = ZodScalarTypeValue[]

export const ZodScalarTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodScalarTypeValue, TValues>
    ): ZodScalarTypeTuple {
        return values as ZodScalarTypeTuple
    },
    get: (): ZodScalarTypeTuple => {
        return ZodScalarTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
        ])
    },
} as const

export const ZodScalarType = {
    is: function (
        context: ZodConversionContext,
        schema: SomeType
    ): schema is WithMaybeZodPassthrough<ZodScalarType> {
        const deepSchema = ZodPassthroughType.pass(context.direction, schema)

        const zodTypes: string[] = ZodScalarTypeTuple.get()

        return zodTypes.includes(deepSchema._zod.def.type)
    },
} as const
