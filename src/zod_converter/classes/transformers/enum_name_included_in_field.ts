import type { Proto3Message } from '#proto3_definition/types/messages'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameIncludedInFieldConversionTransformer implements ZodMessageConversionTransformer {
    private readonly alreadyTransformedIds: Set<string> = new Set()

    transform(
        _schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: Proto3Message
    ): Proto3Message {
        for (const field of protoDefinition.fields) {
            if (field.internalName === 'message_field') {
                if (
                    field.type.internalName === 'enum' &&
                    !this.alreadyTransformedIds.has(field.type.id)
                ) {
                    field.type.name = pascalCase(
                        `${protoDefinition.name}_${field.type.name}`
                    )

                    this.alreadyTransformedIds.add(field.type.id)
                }
            } else {
                for (const subField of field.subFields) {
                    if (
                        subField.type.internalName === 'enum' &&
                        !this.alreadyTransformedIds.has(subField.type.id)
                    ) {
                        subField.type.name = pascalCase(
                            `${subField.type.name}_${field.key}`
                        )
                        this.alreadyTransformedIds.add(subField.type.id)
                    }
                }
            }
        }

        // TODO: immutable instance...
        return protoDefinition
    }
}
