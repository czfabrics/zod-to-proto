import type {
    ReadOnlyProto3DynamicSizeType,
    ReadOnlyProto3MapValueType,
    ReadOnlyProto3RepeatedInnerType,
} from '#proto3_definition/types/dynamic_size'
import type { ReadOnlyProto3MessageFieldType } from '#proto3_definition/types/fields'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3ScalarType } from '#proto3_definition/types/scalars'
import { ZodDynamicSizeConverter } from '#zod_converter/classes/zod_dynamic_size_converter'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import { ZodScalarConverter } from '#zod_converter/classes/zod_scalar_converter'
import {
    ZodDynamicSizeType,
    type ZodMapValueType,
    type ZodRepeatedInnerType,
} from '#zod_converter/types/dynamic_size'
import { SchemaError } from '#zod_converter/types/error'
import { AnyZodMessage, type ZodMessageFieldType } from '#zod_converter/types/messages'
import { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'
import { ZodScalarType } from '#zod_converter/types/scalars'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export class ZodMessageFieldTypeConverter {
    public constructor(
        private readonly reuseStrategies: ConversionReuseStrategies,
        private readonly transformers: ZodConversionTransformers
    ) {}

    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodScalarType>
    ): ReadOnlyProto3ScalarType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodDynamicSizeType>
    ): ReadOnlyProto3DynamicSizeType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<AnyZodMessage>
    ): ReadOnlyAnyProto3Message
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMapValueType>
    ): ReadOnlyProto3MapValueType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodRepeatedInnerType>
    ): ReadOnlyProto3RepeatedInnerType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>
    ): ReadOnlyProto3MessageFieldType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>
    ): ReadOnlyProto3MessageFieldType {
        if (ZodScalarType.is(schema)) {
            const converter = new ZodScalarConverter()

            return converter.convert(schema)
        }

        if (ZodDynamicSizeType.is(schema)) {
            const converter = new ZodDynamicSizeConverter(
                this.reuseStrategies,
                this.transformers
            )

            return converter.convert(key, schema)
        }

        if (AnyZodMessage.is(schema)) {
            const converter = new ZodMessageConverter(
                this.reuseStrategies,
                this.transformers
            )

            return converter.convert(key, schema)
        }

        throw SchemaError.new('Not possible', schema)
    }
}
