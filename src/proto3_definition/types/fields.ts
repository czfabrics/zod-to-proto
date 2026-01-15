import { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { type AnyProto3PrimitifType } from '#proto3_definition/types/primitifs'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { ZodType } from 'zod'
import { SomeType } from 'zod/v4/core'

export type Proto3BaseField = {
    key: string
}

export type Proto3MessageFieldType =
    | AnyProto3PrimitifType
    | AnyProto3Message
    | Proto3ImportedType

export type Proto3MessageField = Proto3BaseField & {
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    index: number
    internalName: 'message_field'
    optionalState: 'PRESENT' | 'NONE' | 'NOT_NEEDED'
    type: Proto3MessageFieldType
    extensions: Proto3Extension[]
    // TODO: faudrait être plus précis...
    schema: SomeType
}

export const Proto3MessageField = {
    new: (params: GetNewParams<Proto3MessageField>): Proto3MessageField => {
        return {
            internalName: 'message_field',
            getDeepMessages() {
                return this.type.getDeepMessages()
            },
            getDeepImportedTypes() {
                return [
                    ...this.type.getDeepImportedTypes(),
                    ...this.extensions.map((extension) =>
                        extension.getDeepImportedTypes()
                    ),
                ].flat()
            },
            getDeepOptionalMessageFields() {
                return [this, ...this.type.getDeepOptionalMessageFields()]
            },
            ...params,
        }
    },
} as const

export type Proto3MessageOneOfFieldSubField = Proto3MessageField & {
    optionalState: 'NOT_NEEDED'
}

export const Proto3MessageOneOfFieldSubField = {
    new: (
        params: GetNewParams<Proto3MessageOneOfFieldSubField>
    ): Proto3MessageOneOfFieldSubField => {
        return {
            ...Proto3MessageField.new(params),
            optionalState: 'NOT_NEEDED',
        }
    },
} as const

export type Proto3MessageOneOfField = Proto3BaseField & {
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    internalName: 'message_one_of_field'
    subFields: Proto3MessageOneOfFieldSubField[]
    schema: ZodType
}

export const Proto3MessageOneOfField = {
    new: (params: GetNewParams<Proto3MessageOneOfField>): Proto3MessageOneOfField => {
        return {
            internalName: 'message_one_of_field',
            getDeepMessages() {
                return this.subFields.map((field) => field.getDeepMessages()).flat()
            },
            getDeepImportedTypes() {
                return this.subFields.map((field) => field.getDeepImportedTypes()).flat()
            },
            getDeepOptionalMessageFields() {
                return this.subFields
                    .map((field) => field.getDeepOptionalMessageFields())
                    .flat()
            },
            ...params,
        }
    },
} as const

export type Proto3EnumField = Proto3BaseField & {
    index: number
    internalName: 'enum_field'
}

export const Proto3EnumField = {
    new: (params: GetNewParams<Proto3EnumField>): Proto3EnumField => {
        return {
            internalName: 'enum_field',
            ...params,
        }
    },
} as const

export type AnyProto3MessageField = Proto3MessageField | Proto3MessageOneOfField
export type AnyProto3Field =
    | Proto3MessageField
    | Proto3MessageOneOfField
    | Proto3EnumField
