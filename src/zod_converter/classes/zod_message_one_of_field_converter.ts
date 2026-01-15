import {
    Proto3MessageOneOfField,
    Proto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { Proto3Message } from '#proto3_definition/types/messages'
import { assertsZodMessageFieldType } from '#zod_converter/asserts/zod_message_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { isZodDiscriminatedUnion } from '#zod_converter/helpers/is_zod_discriminated_union'
import { isZodLiteralNotNullishValues } from '#zod_converter/helpers/is_zod_literal_not_nullish_values'
import { isZodObject } from '#zod_converter/helpers/is_zod_object'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import type { Literal } from '#zod_converter/types/literal'
import type { ZodMessageOneOfFieldType } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { snakeCase } from 'change-case'
import { match } from 'ts-pattern'
import { SomeType } from 'zod/v4/core'

export class ZodMessageOneOfFieldConverter {
    public constructor(
        private readonly message: Proto3Message,
        private readonly transformers: ZodConversionTransformers
    ) {}

    private getSubFields(
        subFieldSchema: SomeType,
        parentKey: string,
        subFieldIndex: number
    ): Proto3MessageOneOfFieldSubField {
        const converter = new ZodMessageFieldConverter(this.message, this.transformers)

        assertsZodMessageFieldType(subFieldSchema)

        const subField = converter.convert(
            `${parentKey}${subFieldIndex}`,
            subFieldSchema,
            'NOT_NEEDED'
        )

        return subField
    }

    private getDiscriminatedSubFields(
        subFieldSchema: SomeType,
        parentKey: string,
        values: Literal[]
    ): Proto3MessageOneOfFieldSubField[] {
        const converter = new ZodMessageFieldConverter(this.message, this.transformers)

        assertsZodMessageFieldType(subFieldSchema)

        const subFields = values.map((value) => {
            return converter.convert(`${parentKey}${value}`, subFieldSchema, 'NOT_NEEDED')
        })

        return subFields
    }

    public convert(
        key: string,
        rootSchema: ZodMessageOneOfFieldType | ZodPassthroughType
    ): Proto3MessageOneOfField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<Proto3MessageOneOfField>()
            .with(zodTypePattern('union'), (schema) => {
                let subFields: Proto3MessageOneOfFieldSubField[] = []

                if (isZodDiscriminatedUnion(schema)) {
                    const discriminator = schema._zod.def.discriminator

                    for (
                        let subFieldIndex = 0;
                        subFieldIndex < schema._zod.def.options.length;
                        subFieldIndex++
                    ) {
                        const subFieldSchema = schema._zod.def.options[subFieldIndex]!

                        if (isZodObject(subFieldSchema)) {
                            const discriminatorSchema =
                                subFieldSchema.shape[discriminator]

                            if (isZodLiteralNotNullishValues(discriminatorSchema)) {
                                const discriminatorValues =
                                    discriminatorSchema._zod.def.values

                                subFields.push(
                                    ...this.getDiscriminatedSubFields(
                                        subFieldSchema,
                                        key,
                                        discriminatorValues
                                    )
                                )

                                continue
                            }
                        }

                        subFields.push(
                            this.getSubFields(subFieldSchema, key, subFieldIndex)
                        )
                    }
                } else {
                    subFields = schema._zod.def.options.map(
                        (subFieldSchema, subFieldIndex) => {
                            return this.getSubFields(subFieldSchema, key, subFieldIndex)
                        }
                    )
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

                return Proto3MessageOneOfField.new({
                    key: snakeCase(key),
                    schema: rootSchema,
                    subFields,
                })
            })
            .exhaustive()
    }
}
