import type { Proto3Message } from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameConversionTransformer implements ZodMessageConversionTransformer {
    transform(
        _schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: Proto3Message
    ): Proto3Message {
        for (const field of protoDefinition.fields) {
            if (field.internalName === 'message_field') {
                if (field.type.internalName === 'enum') {
                    field.type.name = pascalCase(
                        `${protoDefinition.name}_${field.type.name}`
                    )
                }
            } else {
                for (const subField of field.subFields) {
                    if (subField.type.internalName === 'enum') {
                        subField.type.name = pascalCase(
                            `${protoDefinition.name}_${subField.type.name}`
                        )
                    }
                }
            }
        }

        // TODO: immutable instance...
        return protoDefinition
    }
}
