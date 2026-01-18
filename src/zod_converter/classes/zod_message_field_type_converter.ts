import type {
    Proto3DynamicSizeType,
    Proto3MapValueType,
    Proto3RepeatedInnerType,
} from '#proto3_definition/types/dynamic_size'
import type { Proto3MessageFieldType } from '#proto3_definition/types/fields'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import { ZodDynamicSizeConverter } from '#zod_converter/classes/zod_dynamic_size_converter'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import { ZodScalarConverter } from '#zod_converter/classes/zod_scalar_converter'
import {
    ZodDynamicSizeType,
    type ZodMapValueType,
    type ZodRepeatedInnerType,
} from '#zod_converter/types/dynamic_size'
import type { AnyZodMessage, ZodMessageFieldType } from '#zod_converter/types/messages'
import { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import { ZodScalarType } from '#zod_converter/types/scalars'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'

export class ZodMessageFieldTypeConverter {
    public constructor(private readonly transformers: ZodConversionTransformers) {}

    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodScalarType>
    ): Proto3ScalarType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodDynamicSizeType>
    ): Proto3DynamicSizeType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<AnyZodMessage>
    ): AnyProto3Message
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMapValueType>
    ): Proto3MapValueType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodRepeatedInnerType>
    ): Proto3RepeatedInnerType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>
    ): Proto3MessageFieldType
    public convert(
        key: string,
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>
    ): Proto3MessageFieldType {
        if (ZodScalarType.is(schema)) {
            const converter = new ZodScalarConverter()

            return converter.convert(schema)
        }

        if (ZodDynamicSizeType.is(schema)) {
            const converter = new ZodDynamicSizeConverter(this.transformers)

            return converter.convert(key, schema)
        }

        const converter = new ZodMessageConverter(this.transformers)

        return converter.convert(key, schema)
    }
}
