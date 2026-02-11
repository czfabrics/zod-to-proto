import {
    Proto3EnumField,
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import {
    Proto3Enum,
    Proto3Message,
    ReadOnlyAnyProto3Message,
} from '#proto3_definition/types/messages'
import { assertsAnyZodMessageFieldType } from '#zod_converter/asserts/any_zod_message_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { ZodMessageOneOfFieldConverter } from '#zod_converter/classes/zod_message_one_of_field_converter'
import { getZodSchemaComments } from '#zod_converter/helpers/get_zod_schema_comments'
import { ZodMessageFieldType, type AnyZodMessage } from '#zod_converter/types/messages'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ConversionReuseStrategies } from '#zod_converter/types/reuse_strategy'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'
import { match } from 'ts-pattern'
import { ZodEnum, ZodObject } from 'zod'

export class ZodMessageConverter {
    public constructor(
        private readonly reuseStrategies: ConversionReuseStrategies,
        private readonly transformers: ZodConversionTransformers
    ) {}

    private makeMessageFromSchema(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>,
        schema: ZodObject
    ): Proto3Message {
        const message = Proto3Message.new({
            name: pascalCase(name),
            fields: [],
            extensions: [],
            comments: getZodSchemaComments(rootSchema),
        })

        for (const [key, entrySchema] of Object.entries(schema.shape)) {
            assertsAnyZodMessageFieldType(entrySchema)

            let field: Proto3MessageField | Proto3MessageOneOfField

            if (ZodMessageFieldType.is(entrySchema)) {
                const converter = new ZodMessageFieldConverter(
                    message,
                    this.reuseStrategies,
                    this.transformers
                )

                field = converter.convert(key, entrySchema)
            } else {
                const converter = new ZodMessageOneOfFieldConverter(
                    message,
                    this.reuseStrategies,
                    this.transformers
                )

                field = converter.convert(key, entrySchema)
            }

            message.fields.push(field)
        }

        const updatedMessage = this.transformers.message.reduce(
            (message, transformer) => {
                return transformer.transform(rootSchema, message)
            },
            message
        )

        return updatedMessage
    }

    private makeEnumFromSchema(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>,
        schema: ZodEnum
    ): Proto3Enum {
        const fields = Array.from(schema._zod.values).map((value, index) => {
            if (typeof value !== 'string') {
                throw new Error(
                    'This `ZodEnum` contains a value that is not a string, this is impossible depending one the `z.enum()` method type'
                )
            }

            return Proto3EnumField.new({
                index,
                key: value,
                extensions: [],
                comments: [],
            })
        })

        const messageEnum = Proto3Enum.new({
            name: pascalCase(name),
            fields,
            extensions: [],
            comments: getZodSchemaComments(rootSchema),
        })

        const updatedMessageEnum = this.transformers.enum.reduce(
            (messageEnum, transformer) => {
                return transformer.transform(rootSchema, messageEnum)
            },
            messageEnum
        )

        return updatedMessageEnum
    }

    public convert(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>
    ): ReadOnlyAnyProto3Message {
        const deepSchema = ZodPassthroughType.pass(rootSchema)

        return match(deepSchema)
            .returnType<ReadOnlyAnyProto3Message>()
            .with(
                {
                    _zod: {
                        def: {
                            type: 'object',
                        },
                    },
                },
                (schema) => {
                    const storedConversion =
                        this.reuseStrategies.message.reuseConversion(deepSchema)

                    if (storedConversion !== undefined) {
                        return storedConversion
                    }

                    const conversion = this.makeMessageFromSchema(
                        name,
                        rootSchema,
                        schema
                    )

                    this.reuseStrategies.message.storeConversion(deepSchema, conversion)

                    return conversion
                }
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'enum',
                        },
                    },
                },
                (schema) => {
                    const storedConversion =
                        this.reuseStrategies.enum.reuseConversion(deepSchema)

                    if (storedConversion !== undefined) {
                        return storedConversion
                    }

                    const conversion = this.makeEnumFromSchema(name, rootSchema, schema)

                    this.reuseStrategies.enum.storeConversion(deepSchema, conversion)

                    return conversion
                }
            )
            .exhaustive()
    }
}
