import type {
    ReadOnlyAnyProto3MessageField,
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import { TransformationReuseStrategies } from '#zod_converter/types/reuse_strategy'
import type { ZodMessageConversionTransformer } from '#zod_converter/types/transformers'
import { pascalCase } from 'change-case'

export class ZodEnumNameIncludedInFieldConversionTransformer implements ZodMessageConversionTransformer {
    public constructor(private readonly reuseStrategies: TransformationReuseStrategies) {}

    private updateField<
        TField extends
            | ReadOnlyProto3MessageField
            | ReadOnlyProto3MessageOneOfFieldSubField,
    >(parentName: string, isNameInversed: boolean, field: TField): TField {
        if (field.type.internalName === 'map') {
            if (field.type.value.internalName !== 'enum') {
                return field
            }

            const alreadyTransformed = this.reuseStrategies.enum.reuseTransformation(
                field.type.value.id
            )

            if (alreadyTransformed !== undefined) {
                return field.clone({
                    type: field.type.clone({
                        value: alreadyTransformed,
                    }),
                }) as TField
            }

            const updatedValue = field.type.value.duplicate({
                name: isNameInversed
                    ? pascalCase(`${field.type.value.name}_${parentName}`)
                    : pascalCase(`${parentName}_${field.type.value.name}`),
            })

            this.reuseStrategies.enum.storeTransformation(
                field.type.value.id,
                updatedValue
            )

            return field.clone({
                type: field.type.clone({
                    value: updatedValue,
                }),
            }) as TField
        } else if (field.type.internalName === 'repeated') {
            const deepInner = field.type.getDeepInnerType()

            if (deepInner.internalName !== 'enum') {
                return field
            }

            const alreadyTransformed = this.reuseStrategies.enum.reuseTransformation(
                deepInner.id
            )

            if (alreadyTransformed !== undefined) {
                return field.clone({
                    type: field.type.updateDeepInnerType(alreadyTransformed),
                }) as TField
            }

            const updatedDeepInner = deepInner.duplicate({
                name: isNameInversed
                    ? pascalCase(`${deepInner.name}_${parentName}`)
                    : pascalCase(`${parentName}_${deepInner.name}`),
            })

            const newField = field.clone({
                type: field.type.updateDeepInnerType(updatedDeepInner),
            })

            this.reuseStrategies.enum.storeTransformation(deepInner.id, updatedDeepInner)

            return newField as TField
        } else if (
            field.type.internalName === 'enum' &&
            !this.reuseStrategies.enum.reuseTransformation(field.type.id)
        ) {
            const newField = field.clone({
                type: field.type.duplicate({
                    name: isNameInversed
                        ? pascalCase(`${field.type.name}_${parentName}`)
                        : pascalCase(`${parentName}_${field.type.name}`),
                }),
            })

            if (newField.type.internalName === 'enum') {
                this.reuseStrategies.enum.storeTransformation(
                    field.type.id,
                    newField.type
                )
            }

            return newField as TField
        } else if (field.type.internalName === 'enum') {
            const alreadyTransformed = this.reuseStrategies.enum.reuseTransformation(
                field.type.id
            )

            return field.clone({
                //// We keep the same ID after clone for the processor
                type: alreadyTransformed ?? field.type,
            }) as TField
        } else {
            return field
        }
    }

    transform(
        _context: ZodConversionContext,
        _schema: WithMaybeZodPassthrough<AnyZodMessage>,
        protoDefinition: ReadOnlyProto3Message
    ): ReadOnlyProto3Message {
        const newFields: ReadOnlyAnyProto3MessageField[] = []

        for (const field of protoDefinition.fields) {
            if (field.internalName === 'message_field') {
                const newField = this.updateField(protoDefinition.name, false, field)

                newFields.push(newField)
            } else {
                const newSubFields: ReadOnlyProto3MessageOneOfFieldSubField[] = []

                for (const subField of field.subFields) {
                    const newSubField = this.updateField(field.key, true, subField)

                    newSubFields.push(newSubField)
                }

                const newField = field.clone({
                    subFields: newSubFields,
                })

                newFields.push(newField)
            }
        }

        return protoDefinition.duplicate({
            fields: newFields,
        })
    }
}
