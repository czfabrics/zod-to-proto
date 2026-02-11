import { getRandomId } from '#core/helpers/get_random_id'
import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import { CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import {
    ReadOnlyAnyProto3MessageField,
    ReadOnlyProto3EnumField,
    ReadOnlyProto3MessageOneOfFieldSubField,
    type AnyProto3MessageField,
    type Proto3EnumField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3Message = {
    id: string
    internalName: 'message'
    clone(params: CloneParams<Proto3Message>): ReadOnlyProto3Message
    addPrefix(prefix: string): ReadOnlyProto3Message
    computeNewIndexForFields(
        fields: readonly ReadOnlyAnyProto3MessageField[]
    ): readonly ReadOnlyAnyProto3MessageField[]
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getNextIndex(): number
    /**
     * @example 'User'
     */
    name: string
    fields: AnyProto3MessageField[]
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3Message = DeepReadOnly<Proto3Message>

export const Proto3Message = {
    new: function (params: GetNewParams<Proto3Message>): ReadOnlyProto3Message {
        return {
            id: getRandomId(),
            internalName: 'message',
            clone(
                this: ReadOnlyProto3Message,
                params: PurgeUndefinedValues<CloneParams<Proto3Message>>
            ): ReadOnlyProto3Message {
                if (params?.fields !== undefined) {
                    const newFields = this.computeNewIndexForFields(params?.fields)

                    return {
                        ...this,
                        ...params,
                        id: params?.id ?? getRandomId(),
                        fields: newFields,
                    }
                }

                return {
                    ...this,
                    ...params,
                    id: params?.id ?? getRandomId(),
                }
            },
            addPrefix(
                this: ReadOnlyProto3Message,
                prefix: string
            ): ReadOnlyProto3Message {
                const fields = this.fields.map((field) =>
                    field.propagateTypePrefix(prefix)
                )

                return {
                    ...this,
                    name: `${prefix}${this.name}`,
                    fields: fields,
                }
            },
            computeNewIndexForFields(
                fields: readonly ReadOnlyAnyProto3MessageField[]
            ): readonly ReadOnlyAnyProto3MessageField[] {
                const newFields: ReadOnlyAnyProto3MessageField[] = []

                let currentIndex = 1

                for (const field of fields) {
                    if (field.internalName === 'message_field') {
                        const newField = field.clone({
                            index: currentIndex,
                        })

                        newFields.push(newField)

                        currentIndex++
                    } else {
                        const newSubFields: ReadOnlyProto3MessageOneOfFieldSubField[] = []

                        for (const subField of field.subFields) {
                            const newSubField = subField.clone({
                                index: currentIndex,
                            })

                            newSubFields.push(newSubField)

                            currentIndex++
                        }

                        const newField = field.clone({
                            subFields: newSubFields,
                        })

                        newFields.push(newField)
                    }
                }

                return newFields
            },
            getDeepMessages() {
                const deepMessages = this.fields
                    .map((field) => field.getDeepMessages())
                    .flat()

                return [this, ...deepMessages]
            },
            getDeepImportedTypes() {
                return this.fields.map((field) => field.getDeepImportedTypes()).flat()
            },
            getNextIndex() {
                const normalFieldsCount = this.fields.filter(
                    (field) => field.internalName === 'message_field'
                ).length

                const oneOfFieldsCounts = this.fields
                    .filter((field) => field.internalName === 'message_one_of_field')
                    .map((field) => field.subFields.length)

                const counts = [normalFieldsCount, oneOfFieldsCounts].flat()
                const fieldsCount = counts.reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                )

                return fieldsCount + 1
            },
            ...params,
        }
    },
} as const

export type Proto3Enum = {
    id: string
    internalName: 'enum'
    clone(params: CloneParams<Proto3Enum>): ReadOnlyProto3Enum
    addPrefix(prefix: string): ReadOnlyProto3Enum
    computeNewIndexForFields(
        fields: readonly ReadOnlyProto3EnumField[]
    ): readonly ReadOnlyProto3EnumField[]
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    name: string
    fields: Proto3EnumField[]
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3Enum = DeepReadOnly<Proto3Enum>

export const Proto3Enum = {
    new: function (params: GetNewParams<Proto3Enum>): ReadOnlyProto3Enum {
        return {
            id: getRandomId(),
            internalName: 'enum',
            clone(
                this: ReadOnlyProto3Enum,
                params: PurgeUndefinedValues<CloneParams<Proto3Enum>>
            ): ReadOnlyProto3Enum {
                if (params?.fields !== undefined) {
                    const newFields = this.computeNewIndexForFields(params?.fields)

                    return {
                        ...this,
                        ...params,
                        id: params?.id ?? getRandomId(),
                        fields: newFields,
                    }
                }

                return {
                    ...this,
                    ...params,
                    id: params?.id ?? getRandomId(),
                }
            },
            addPrefix(this: ReadOnlyProto3Enum, prefix: string): ReadOnlyProto3Enum {
                return {
                    ...this,
                    name: `${prefix}${this.name}`,
                }
            },
            computeNewIndexForFields(
                fields: readonly ReadOnlyProto3EnumField[]
            ): readonly ReadOnlyProto3EnumField[] {
                const newFields: ReadOnlyProto3EnumField[] = []

                let currentIndex = 1

                for (const field of fields) {
                    const newField = field.clone({
                        index: currentIndex,
                    })

                    newFields.push(newField)

                    currentIndex++
                }

                return newFields
            },
            getDeepMessages() {
                return [this]
            },
            getDeepImportedTypes() {
                return []
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3Enum>
    },
} as const

export type AnyProto3Message = Proto3Message | Proto3Enum
export type ReadOnlyAnyProto3Message = DeepReadOnly<AnyProto3Message>
