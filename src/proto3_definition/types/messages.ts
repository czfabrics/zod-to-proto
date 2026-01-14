import type {
    AnyProto3MessageField,
    Proto3EnumField,
    Proto3MessageField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import type { ZodType } from 'zod'

export type Proto3Message = {
    internalName: 'message'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
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
            getDeepOptionalMessageFields() {
                return this.fields
                    .map((field) => field.getDeepOptionalMessageFields())
                    .flat()
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
    internalName: 'enum'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
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
            getDeepOptionalMessageFields() {
                return []
            },
            ...params,
        }
    },
} as const

export type AnyProto3Message = Proto3Message | Proto3Enum
