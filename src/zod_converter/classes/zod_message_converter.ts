import {
    Proto3EnumField,
    type ReadOnlyAnyProto3MessageField,
    type ReadOnlyProto3MessageField,
    type ReadOnlyProto3MessageOneOfField,
} from '#proto3_definition/types/fields'
import {
    Proto3Enum,
    Proto3Message,
    type ReadOnlyAnyProto3Message,
    type ReadOnlyProto3Enum,
    type ReadOnlyProto3Message,
} from '#proto3_definition/types/messages'
import { assertsAnyZodMessageFieldType } from '#zod_converter/asserts/any_zod_message_field_type'
import { ZodMessageFieldConverter } from '#zod_converter/classes/zod_message_field_converter'
import { ZodMessageOneOfFieldConverter } from '#zod_converter/classes/zod_message_one_of_field_converter'
import { getZodSchemaComments } from '#zod_converter/helpers/get_zod_schema_comments'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import { ZodMessageFieldType, type AnyZodMessage } from '#zod_converter/types/messages'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type {
    ConversionReuseStrategies,
    TransformationReuseStrategies,
} from '#zod_converter/types/reuse_strategy'
import { ZodConversionTransformers } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'
import { match } from 'ts-pattern'
import { ZodEnum, ZodObject } from 'zod'

export class ZodMessageConverter {
    public constructor(
        private readonly context: ZodConversionContext,
        private readonly conversionReuseStrategies: ConversionReuseStrategies,
        private readonly transformers: ZodConversionTransformers,
        private readonly transformationReuseStrategies: TransformationReuseStrategies
    ) {}

    private makeMessageFromSchema(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>,
        schema: ZodObject
    ): ReadOnlyProto3Message {
        let message = Proto3Message.new({
            name: pascalCase(name),
            fields: [],
            extensions: [],
            comments: getZodSchemaComments(this.context, rootSchema),
        })

        const fields: ReadOnlyAnyProto3MessageField[] = []

        for (const [key, entrySchema] of Object.entries(schema.shape)) {
            assertsAnyZodMessageFieldType(this.context, entrySchema)

            let field: ReadOnlyProto3MessageField | ReadOnlyProto3MessageOneOfField

            if (ZodMessageFieldType.is(this.context, entrySchema)) {
                const converter = new ZodMessageFieldConverter(
                    this.context,
                    message,
                    this.conversionReuseStrategies,
                    this.transformers,
                    this.transformationReuseStrategies
                )

                field = converter.convert(key, entrySchema)
            } else {
                const converter = new ZodMessageOneOfFieldConverter(
                    this.context,
                    message,
                    this.conversionReuseStrategies,
                    this.transformers,
                    this.transformationReuseStrategies
                )

                field = converter.convert(key, entrySchema)
            }

            fields.push(field)
        }

        message = message.clone({
            fields,
        })

        const transformerInstances = ZodConversionTransformers.intoInstances(
            this.transformers,
            this.transformationReuseStrategies
        )

        message = transformerInstances.message.reduce((message, transformer) => {
            return transformer.transform(this.context, rootSchema, message)
        }, message)

        return message
    }

    private makeEnumFromSchema(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>,
        schema: ZodEnum
    ): ReadOnlyProto3Enum {
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
            comments: getZodSchemaComments(this.context, rootSchema),
        })

        const transformerInstances = ZodConversionTransformers.intoInstances(
            this.transformers,
            this.transformationReuseStrategies
        )

        const updatedMessageEnum = transformerInstances.enum.reduce(
            (messageEnum, transformer) => {
                return transformer.transform(this.context, rootSchema, messageEnum)
            },
            messageEnum
        )

        return updatedMessageEnum
    }

    public convert(
        name: string,
        rootSchema: WithMaybeZodPassthrough<AnyZodMessage>
    ): ReadOnlyAnyProto3Message {
        const deepSchema = ZodPassthroughType.pass(this.context.direction, rootSchema)

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
                        this.conversionReuseStrategies.message.reuseConversion(deepSchema)

                    if (storedConversion !== undefined) {
                        return storedConversion
                    }

                    const conversion = this.makeMessageFromSchema(
                        name,
                        rootSchema,
                        schema
                    )

                    this.conversionReuseStrategies.message.storeConversion(
                        deepSchema,
                        conversion
                    )

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
                        this.conversionReuseStrategies.enum.reuseConversion(deepSchema)

                    if (storedConversion !== undefined) {
                        return storedConversion
                    }

                    const conversion = this.makeEnumFromSchema(name, rootSchema, schema)

                    this.conversionReuseStrategies.enum.storeConversion(
                        deepSchema,
                        conversion
                    )

                    return conversion
                }
            )
            .exhaustive()
    }
}
