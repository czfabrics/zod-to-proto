import type {
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import type {
    ReadOnlyProto3Enum,
    ReadOnlyProto3Message,
} from '#proto3_definition/types/messages'
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
    ReadOnlyProto3Message
>

export type ZodMessageFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageFieldType>,
    ReadOnlyProto3MessageField
>

export type ZodMessageOneOfFieldConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<ZodMessageOneOfFieldType>,
    ReadOnlyProto3MessageOneOfField
>

export type ZodEnumConversionTransformer = ZodConversionTransformer<
    WithMaybeZodPassthrough<AnyZodMessage>,
    ReadOnlyProto3Enum
>

export type ZodConversionTransformers = {
    message: ZodMessageConversionTransformer[]
    messageField: ZodMessageFieldConversionTransformer[]
    messageOneOfField: ZodMessageOneOfFieldConversionTransformer[]
    enum: ZodEnumConversionTransformer[]
}
