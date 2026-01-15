import {
    Proto3EnumField,
    Proto3MessageField,
    Proto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import {
    Proto3Enum,
    Proto3Message,
    type AnyProto3Message,
} from '#proto3_definition/types/messages'
import { assertsAnyZodMessageFieldType } from '#zod_converter/asserts/any_zod_message_field_type'
import { assertsZodMessageFieldType } from '#zod_converter/asserts/zod_message_field_type'
import { assertsZodMessageOneOfFieldType } from '#zod_converter/asserts/zod_message_one_of_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { ZodMessageOneOfFieldConverter } from '#zod_converter/classes/zod_message_one_of_field_converter'
import { zodTypePattern } from '#zod_converter/helpers/zod_type_pattern'
import { ZodMessageFieldType, type AnyZodMessage } from '#zod_converter/types/messages'
import { ZodPassthroughType } from '#zod_converter/types/passthroughs'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'
import { match } from 'ts-pattern'

export class ZodMessageConverter {
    public constructor(private readonly transformers: ZodConversionTransformers) {}

    public convert(
        name: string,
        // TODO: par contre si on prend ZodCatch, on ne sait pas si c'est un ZodMessageFieldType en innerType...
        rootSchema: AnyZodMessage | ZodPassthroughType
    ): AnyProto3Message {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<AnyProto3Message>()
            .with(zodTypePattern('object'), (schema) => {
                const message = Proto3Message.new({
                    name: pascalCase(name),
                    fields: [],
                    schema: rootSchema,
                })

                for (const [key, entrySchema] of Object.entries(schema.shape)) {
                    assertsAnyZodMessageFieldType(entrySchema)

                    const entryDeepSchema = ZodPassthroughType.pass(entrySchema)

                    let field: Proto3MessageField | Proto3MessageOneOfField

                    if (ZodMessageFieldType.is(entryDeepSchema)) {
                        assertsZodMessageFieldType(entrySchema)

                        const converter = new ZodMessageFieldConverter(
                            message,
                            this.transformers
                        )

                        field = converter.convert(key, entrySchema)
                    } else {
                        assertsZodMessageOneOfFieldType(entrySchema)

                        const converter = new ZodMessageOneOfFieldConverter(
                            message,
                            this.transformers
                        )

                        field = converter.convert(key, entrySchema)
                    }

                    message.fields.push(field)
                }

                return message
            })
            .with(zodTypePattern('enum'), (schema) => {
                const fields = Array.from(schema._zod.values).map((value, index) => {
                    if (typeof value !== 'string') {
                        throw new Error(
                            'This `ZodEnum` contains a value that is not a string, this is impossible depending one the `z.enum()` method type'
                        )
                    }

                    return Proto3EnumField.new({
                        index,
                        key: value,
                    })
                })

                return Proto3Enum.new({
                    name: pascalCase(name),
                    fields,
                    schema: rootSchema,
                })
            })
            .exhaustive()
    }
}
