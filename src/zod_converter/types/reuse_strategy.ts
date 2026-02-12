import { ReadOnly } from '#core/types/read_only'
import { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import { AnyZodMessage } from '#zod_converter/types/messages'
import type { SomeType } from 'zod/v4/core'

export type ConversionReuseStrategy<TSchema extends SomeType, TProtoDefinition> = {
    reuseConversion(schema: TSchema): ReadOnly<TProtoDefinition> | undefined
    storeConversion(schema: TSchema, protoMessage: ReadOnly<TProtoDefinition>): void
}

export type ConversionReuseStrategies = {
    message: ConversionReuseStrategy<AnyZodMessage, Proto3Message>
    enum: ConversionReuseStrategy<AnyZodMessage, Proto3Enum>
}
