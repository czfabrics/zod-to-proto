import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import { Proto3MapType, Proto3RepeatedType } from '#proto3_definition/types/dynamic_size'
import { assertsZodMapValueType } from '#zod_converter/asserts/zod_map_value'
import { assertsZodRepeatedInnerType } from '#zod_converter/asserts/zod_repeated_inner_type'
import { assertsZodScalarType } from '#zod_converter/asserts/zod_scalar_type'
import { ZodMessageFieldTypeConverter } from '#zod_converter/classes/zod_message_field_type_converter'
import type { ZodDynamicSizeType } from '#zod_converter/types/dynamic_size'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import pluralize from 'pluralize'
import { match } from 'ts-pattern'

export class ZodDynamicSizeConverter {
    public constructor(private readonly transformers: ZodConversionTransformers) {}

    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodDynamicSizeType>
    ): Proto3DynamicSizeType {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<Proto3DynamicSizeType>()
            .with(
                {
                    _zod: {
                        def: {
                            type: 'array',
                        },
                    },
                },
                (schema) => {
                    const converter = new ZodMessageFieldTypeConverter(this.transformers)

                    assertsZodRepeatedInnerType(schema._zod.def.element)

                    const inner = converter.convert(
                        pluralize(key, 1),
                        schema._zod.def.element
                    )

                    return Proto3RepeatedType.new({
                        inner,
                    })
                }
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'set',
                        },
                    },
                },
                (schema) => {
                    const converter = new ZodMessageFieldTypeConverter(this.transformers)

                    assertsZodRepeatedInnerType(schema._zod.def.valueType)

                    const inner = converter.convert(key, schema._zod.def.valueType)

                    return Proto3RepeatedType.new({
                        inner,
                    })
                }
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'record',
                        },
                    },
                },
                (schema) => {
                    const converter = new ZodMessageFieldTypeConverter(this.transformers)

                    assertsZodScalarType(schema._zod.def.keyType)

                    const keyType = converter.convert(key, schema._zod.def.keyType as any)

                    assertsZodMapValueType(schema._zod.def.valueType)

                    const valueType = converter.convert(key, schema._zod.def.valueType)

                    return Proto3MapType.new({
                        key: keyType,
                        value: valueType,
                    })
                }
            )
            .exhaustive()
    }
}
