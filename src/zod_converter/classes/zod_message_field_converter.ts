import {
    Proto3MessageField,
    Proto3MessageOneOfFieldSubField,
    type Proto3OptionalState,
} from '#proto3_definition/types/fields'
import type { Proto3Message } from '#proto3_definition/types/messages'
import { ZodMessageFieldTypeConverter } from '#zod_converter/classes/zod_message_field_type_converter'
import { getZodSchemaComments } from '#zod_converter/helpers/get_zod_schema_comments'
import { isZodSchemaOptional } from '#zod_converter/helpers/is_zod_schema_optional'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { snakeCase } from 'change-case'

export class ZodMessageFieldConverter {
    public constructor(
        private readonly message: Proto3Message,
        private readonly transformers: ZodConversionTransformers
    ) {}

    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        optionalKeywordState?: 'PRESENT' | 'NONE'
    ): Proto3MessageField
    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        optionalKeywordState: 'NOT_NEEDED'
    ): Proto3MessageOneOfFieldSubField
    public convert(
        key: string,
        rootSchema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        optionalState?: Proto3OptionalState
    ): Proto3MessageField | Proto3MessageOneOfFieldSubField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        const converter = new ZodMessageFieldTypeConverter(this.transformers)

        optionalState ??= isZodSchemaOptional(rootSchema) ? 'PRESENT' : 'NONE'

        const index = this.message.getNextIndex()
        const type = converter.convert(key, deepSchema)

        const field = Proto3MessageField.new({
            index,
            key: snakeCase(key),
            optionalState: optionalState,
            type,
            extensions: [],
            comments: getZodSchemaComments(rootSchema),
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
