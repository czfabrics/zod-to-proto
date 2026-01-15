import {
    Proto3MessageField,
    Proto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { Proto3Message } from '#proto3_definition/types/messages'
import { ZodMessageFieldTypeConverter } from '#zod_converter/classes/zod_message_field_type_converter'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { snakeCase } from 'change-case'

export class ZodMessageFieldConverter {
    public constructor(
        private readonly message: Proto3Message,
        private readonly transformers: ZodConversionTransformers
    ) {}

    public convert(
        key: string,
        rootSchema: ZodMessageFieldType | ZodPassthroughType,
        optionalKeywordState?: 'PRESENT' | 'NONE'
    ): Proto3MessageField
    public convert(
        key: string,
        rootSchema: ZodMessageFieldType | ZodPassthroughType,
        optionalKeywordState: 'NOT_NEEDED'
    ): Proto3MessageOneOfFieldSubField
    public convert(
        key: string,
        rootSchema: ZodMessageFieldType | ZodPassthroughType,
        // TODO: enum
        optionalState?: 'PRESENT' | 'NONE' | 'NOT_NEEDED'
    ): Proto3MessageField | Proto3MessageOneOfFieldSubField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        const converter = new ZodMessageFieldTypeConverter(this.transformers)

        optionalState ??= rootSchema.safeParse(undefined).success ? 'PRESENT' : 'NONE'

        const index = this.message.getNextIndex()
        const type = converter.convert(key, deepSchema)

        const field = Proto3MessageField.new({
            index,
            key: snakeCase(key),
            optionalState: optionalState,
            type,
            schema: rootSchema,
            extensions: [],
        })

        const updatedField = this.transformers.messageField.reduce(
            (field, transformer) => {
                return transformer.transform(rootSchema, field)
            },
            field
        )

        return updatedField
    }
}
