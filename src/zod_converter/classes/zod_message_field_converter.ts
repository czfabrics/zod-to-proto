import { Proto3MessageField } from '#proto3_definition/types/fields'
import type { Proto3Message } from '#proto3_definition/types/messages'
import { ZodMessageFieldTypeConverter } from '#zod_converter/classes/zod_message_field_type_converter'
import type { ZodMessageFieldType } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { snakeCase } from 'change-case'

export class ZodMessageFieldConverter {
    public constructor(private readonly message: Proto3Message) {}

    public convert(
        key: string,
        rootSchema: ZodMessageFieldType | ZodPassthroughType
    ): Proto3MessageField {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        const converter = new ZodMessageFieldTypeConverter()

        const index = this.message.getNextIndex()
        const type = converter.convert(key, deepSchema)

        return Proto3MessageField.new({
            index,
            key: snakeCase(key),
            type,
            schema: rootSchema,
            extensions: [],
        })
    }
}
