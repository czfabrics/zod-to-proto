import type {
    Proto3EnumField,
    Proto3MessageField,
    Proto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import type { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import type {
    AnyZodMessage,
    ZodMessageFieldType,
    ZodMessageOneOfFieldType,
} from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

export interface ZodConversionTransformer<TSchema extends SomeType, TProtoDefinition> {
    transform(schema: TSchema, protoDefinition: TProtoDefinition): TProtoDefinition
}

export type ZodMessageConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    Proto3Message
>

export type ZodMessageFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageFieldType>,
    Proto3MessageField
>

export type ZodMessageOneOfFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageOneOfFieldType>,
    Proto3MessageOneOfField
>

export type ZodEnumConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    Proto3Enum
>

export type ZodEnumFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    Proto3EnumField
>

export type ZodConversionTransformers = {
    message: ZodMessageConversionTransformer[]
    messageField: ZodMessageFieldConversionTransformer[]
    messageOneOfField: ZodMessageOneOfFieldConversionTransformer[]
    enum: ZodEnumConversionTransformer[]
}
