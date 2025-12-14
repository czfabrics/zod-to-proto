import { CheckTuple } from '#core/types/check_tuple'
import { ZodTypeCategory0 } from '#zod_converter/types/check'
import { GetZodTypeValue } from '#zod_converter/types/zod_type_value'
import { ZodEnum } from 'zod'
import { SomeType } from 'zod/v4/core'

export type ZodPrimitifType = Exclude<ZodTypeCategory0, ZodEnum>

export type ZodPrimitifTypeValue = GetZodTypeValue<ZodPrimitifType>
export type ZodPrimitifTypeTuple = ZodPrimitifTypeValue[]

export const ZodPrimitifTypeTuple = {
    new: function <const TValues extends string[]>(
        values: CheckTuple<ZodPrimitifTypeValue, TValues>
    ): ZodPrimitifTypeTuple {
        return values as ZodPrimitifTypeTuple
    },
} as const

export const ZodPrimitifType = {
    is: (schema: SomeType): schema is ZodPrimitifType => {
        const zodTypes: ZodPrimitifTypeTuple = ZodPrimitifTypeTuple.new([
            'string',
            'number',
            'bigint',
            'boolean',
            'literal',
            'template_literal',
            'date',
            'file',
        ])

        return (zodTypes as string[]).includes(schema._zod.def.type)
    },
} as const
