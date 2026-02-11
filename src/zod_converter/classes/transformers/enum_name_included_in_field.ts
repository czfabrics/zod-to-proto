import type {
    ReadOnlyAnyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type {
    ReadOnlyAnyProto3Message,
    ReadOnlyProto3Message,
} from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameIncludedInFieldConversionTransformer implements ZodMessageConversionTransformer {
    private readonly alreadyTransformedMessages: Map<string, ReadOnlyAnyProto3Message> =
        new Map()

    transform(
        _schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Message
    ): ReadOnlyProto3Message {
        const newFields: ReadOnlyAnyProto3MessageField[] = []

        for (const field of protoDefinition.fields) {
            if (field.internalName === 'message_field') {
                if (
                    field.type.internalName === 'enum' &&
                    !this.alreadyTransformedMessages.has(field.type.id)
                ) {
                    const newField = field.clone({
                        type: field.type.clone({
                            name: pascalCase(
                                `${protoDefinition.name}_${field.type.name}`
                            ),
                        }),
                    })

                    newFields.push(newField)

                    if (newField.type.internalName === 'enum') {
                        this.alreadyTransformedMessages.set(field.type.id, newField.type)
                    }
                } else if (field.type.internalName === 'enum') {
                    const alreadyTransformed = this.alreadyTransformedMessages.get(
                        field.type.id
                    )

                    newFields.push(
                        field.clone({
                            //// We keep the same ID after clone for the processor
                            type:
                                alreadyTransformed?.clone({
                                    id: alreadyTransformed.id,
                                }) ?? field.type,
                        })
                    )
                } else {
                    newFields.push(field)
                }
            } else {
                const newSubFields: ReadOnlyProto3MessageOneOfFieldSubField[] = []

                for (const subField of field.subFields) {
                    if (
                        subField.type.internalName === 'enum' &&
                        !this.alreadyTransformedMessages.has(subField.type.id)
                    ) {
                        const newSubField = subField.clone({
                            type: subField.type.clone({
                                name: pascalCase(`${subField.type.name}_${field.key}`),
                            }),
                        })

                        newSubFields.push(newSubField)

                        if (newSubField.type.internalName === 'enum') {
                            this.alreadyTransformedMessages.set(
                                subField.type.id,
                                newSubField.type
                            )
                        }
                    } else if (subField.type.internalName === 'enum') {
                        const alreadyTransformed = this.alreadyTransformedMessages.get(
                            subField.type.id
                        )

                        newSubFields.push(
                            subField.clone({
                                //// We keep the same ID after clone for the processor
                                type:
                                    alreadyTransformed?.clone({
                                        id: alreadyTransformed.id,
                                    }) ?? subField.type,
                            })
                        )
                    } else {
                        newSubFields.push(subField)
                    }
                }

                const newField = field.clone({
                    subFields: newSubFields,
                })

                newFields.push(newField)
            }
        }

        return protoDefinition.clone({
            fields: newFields,
        })
    }
}
