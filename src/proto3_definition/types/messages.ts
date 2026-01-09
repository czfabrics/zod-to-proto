import type {
    AnyProto3MessageField,
    Proto3EnumField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import type { ZodType } from 'zod'

export type Proto3Message = {
    internalName: 'message'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getNextIndex(): number
    name: string
    schema: ZodType
    fields: AnyProto3MessageField[]
}

export const Proto3Message = {
    new: (params: GetNewParams<Proto3Message>): Proto3Message => {
        return {
            internalName: 'message',
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
                return this.fields.length
            },
            ...params,
        }
    },
} as const

export type Proto3Enum = {
    internalName: 'enum'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    name: string
    schema: ZodType
    fields: Proto3EnumField[]
}

export const Proto3Enum = {
    new: (params: GetNewParams<Proto3Enum>): Proto3Enum => {
        return {
            internalName: 'enum',
            getDeepMessages() {
                return [this]
            },
            getDeepImportedTypes() {
                return []
            },
            ...params,
        }
    },
} as const

export type AnyProto3Message = Proto3Message | Proto3Enum
