import type { Proto3MessageFieldType } from '#proto3_definition/types/fields'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type {
    Proto3ComplexPrimitifType,
    Proto3MapValueType,
    Proto3PrimitifType,
    Proto3RepeatedInnerType,
} from '#proto3_definition/types/primitifs'
import { ZodComplexPrimitifConverter } from '#zod_converter/classes/zod_complex_primitif_converter'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import { ZodPrimitifConverter } from '#zod_converter/classes/zod_primitif_converter'
import {
    ZodComplexPrimitifType,
    type ZodMapValueType,
    type ZodRepeatedInnerType,
} from '#zod_converter/types/complex_primitifs'
import type { AnyZodMessage, ZodMessageFieldType } from '#zod_converter/types/messages'
import type { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodPrimitifType } from '#zod_converter/types/primitifs'

export class ZodMessageFieldTypeConverter {
    public convert(
        key: string,
        schema: ZodPrimitifType | ZodPassthroughType
    ): Proto3PrimitifType
    public convert(
        key: string,
        schema: ZodComplexPrimitifType | ZodPassthroughType
    ): Proto3ComplexPrimitifType
    public convert(
        key: string,
        schema: AnyZodMessage | ZodPassthroughType
    ): AnyProto3Message
    public convert(
        key: string,
        schema: ZodMapValueType | ZodPassthroughType
    ): Proto3MapValueType
    public convert(
        key: string,
        schema: ZodRepeatedInnerType | ZodPassthroughType
    ): Proto3RepeatedInnerType
    public convert(
        key: string,
        schema: ZodMessageFieldType | ZodPassthroughType
    ): Proto3MessageFieldType
    public convert(
        key: string,
        schema: ZodMessageFieldType | ZodPassthroughType
    ): Proto3MessageFieldType {
        if (ZodPrimitifType.is(schema)) {
            const converter = new ZodPrimitifConverter()

            return converter.convert(schema)
        }

        if (ZodComplexPrimitifType.is(schema)) {
            const converter = new ZodComplexPrimitifConverter()

            return converter.convert(key, schema)
        }

        const converter = new ZodMessageConverter()

        return converter.convert(key, schema)
    }
}
