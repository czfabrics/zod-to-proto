import { assertsOneElementArray } from '#core/asserts/one_element_array'
import {
    Proto3MessageOneOfField,
    ReadOnlyProto3MessageOneOfField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import { assertsZodMessageFieldType } from '#zod_converter/asserts/zod_message_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { getZodSchemaComments } from '#zod_converter/helpers/get_zod_schema_comments'
import type { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { snakeCase } from 'change-case'
import { SomeType } from 'zod/v4/core'

export class ZodMessageOneOfFieldConverter {
    public constructor(
        private readonly message: ReadOnlyProto3Message,
        private readonly reuseStrategies: ConversionReuseStrategies,
        private readonly transformers: ZodConversionTransformers
    ) {}

    private getSubField(
        schema: SomeType,
        key: string
    ): ReadOnlyProto3MessageOneOfFieldSubField {
        const converter = new ZodMessageFieldConverter(this.message, this.reuseStrategies, this.transformers)

        assertsZodMessageFieldType(schema)

        const subField = converter.convert(key, schema, 'NOT_NEEDED')

        return subField
    }

    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodMessageOneOfFieldType>
    ): ReadOnlyProto3MessageOneOfField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        let subFields: ReadOnlyProto3MessageOneOfFieldSubField[] = []

        for (
            let subFieldIndex = 0;
            subFieldIndex < deepSchema._zod.def.options.length;
            subFieldIndex++
        ) {
            const unionOptionSchema = deepSchema._zod.def.options[subFieldIndex]!

            const caseName = unionOptionSchema.shape.$case._zod.def.values
            const valueSchema = unionOptionSchema.shape.value

            assertsOneElementArray(caseName)

            const subField = this.getSubField(valueSchema, caseName[0])

            subFields.push(subField)
        }

        for (let subFieldIndex = 0; subFieldIndex < subFields.length; subFieldIndex++) {
            const subField = subFields[subFieldIndex]!

            //// We override to take into account other sub fields
            //// & generated ones by literal discriminator
            const newSubField = subField.clone({
                index: this.message.getNextIndex() + subFieldIndex,
            })

            subFields.splice(subFieldIndex, 1, newSubField)
        }

        const field = Proto3MessageOneOfField.new({
            key: snakeCase(key),
            subFields,
            extensions: [],
            comments: getZodSchemaComments(rootSchema),
        })

        const updatedField = this.transformers.messageOneOfField.reduce(
            (field, transformer) => {
                return transformer.transform(rootSchema, field)
            },
            field
        )

        return updatedField
    }
}
