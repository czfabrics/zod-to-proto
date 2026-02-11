import type {
    ReadOnlyAnyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodMessageNameIncludedInFieldConversionTransformer implements ZodMessageConversionTransformer {
    private readonly alreadyTransformedIds: Set<string> = new Set()

    transform(
        _schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Message
    ): ReadOnlyProto3Message {
        const newFields: ReadOnlyAnyProto3MessageField[] = []

        for (const field of protoDefinition.fields) {
            if (field.internalName === 'message_field') {
                if (
                    field.type.internalName === 'message' &&
                    !this.alreadyTransformedIds.has(field.type.id)
                ) {
                    const newField = field.clone({
                        type: field.type.clone({
                            name: pascalCase(
                                `${protoDefinition.name}_${field.type.name}`
                            ),
                        }),
                    })

                    newFields.push(newField)

                    this.alreadyTransformedIds.add(field.type.id)
                } else {
                    newFields.push(field)
                }
            } else {
                const newSubFields: ReadOnlyProto3MessageOneOfFieldSubField[] = []

                for (const subField of field.subFields) {
                    if (
                        subField.type.internalName === 'message' &&
                        !this.alreadyTransformedIds.has(subField.type.id)
                    ) {
                        const newSubField = subField.clone({
                            type: subField.type.clone({
                                name: pascalCase(`${subField.type.name}_${field.key}`),
                            }),
                        })

                        newSubFields.push(newSubField)

                        this.alreadyTransformedIds.add(subField.type.id)
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
