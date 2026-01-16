import { assertsOneElementArray } from '#core/asserts/one_element_array'
import {
    Proto3MessageOneOfField,
    Proto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { Proto3Message } from '#proto3_definition/types/messages'
import { assertsZodMessageFieldType } from '#zod_converter/asserts/zod_message_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { snakeCase } from 'change-case'
import { match } from 'ts-pattern'
import { SomeType } from 'zod/v4/core'

export class ZodMessageOneOfFieldConverter {
    public constructor(
        private readonly message: Proto3Message,
        private readonly transformers: ZodConversionTransformers
    ) {}

    private getSubField(schema: SomeType, key: string): Proto3MessageOneOfFieldSubField {
        const converter = new ZodMessageFieldConverter(this.message, this.transformers)

        assertsZodMessageFieldType(schema)

        const subField = converter.convert(key, schema, 'NOT_NEEDED')

        return subField
    }

    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodMessageOneOfFieldType>
    ): Proto3MessageOneOfField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<Proto3MessageOneOfField>()
            .with(zodTypePattern('union'), (schema) => {
                let subFields: Proto3MessageOneOfFieldSubField[] = []

                for (
                    let subFieldIndex = 0;
                    subFieldIndex < schema._zod.def.options.length;
                    subFieldIndex++
                ) {
                    const unionOptionSchema = schema._zod.def.options[subFieldIndex]!

                    const caseName = unionOptionSchema.shape.$case._zod.def.values
                    const valueSchema = unionOptionSchema.shape.value

                    assertsOneElementArray(caseName)

                    const subField = this.getSubField(valueSchema, caseName[0])

                    subFields.push(subField)
                }

                for (
                    let subFieldIndex = 0;
                    subFieldIndex < subFields.length;
                    subFieldIndex++
                ) {
                    const subField = subFields[subFieldIndex]!

                    //// We override to take into account other sub fields
                    //// & generated ones by literal discriminator
                    subField.index = this.message.getNextIndex() + subFieldIndex
                }

                const field = Proto3MessageOneOfField.new({
                    key: snakeCase(key),
                    schema: rootSchema,
                    subFields,
                    extensions: [],
                })

                const updatedField = this.transformers.messageOneOfField.reduce(
                    (field, transformer) => {
                        return transformer.transform(rootSchema, field)
                    },
                    field
                )

                return updatedField
            })
            .exhaustive()
    }
}
