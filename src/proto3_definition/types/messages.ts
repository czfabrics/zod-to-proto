import { getRandomId } from '#core/helpers/get_random_id'
import { Proto3Extension } from '#proto3_definition/types/extension'
import type {
    AnyProto3MessageField,
    Proto3EnumField,
} from '#proto3_definition/types/fields'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3Message = {
    id: string
    internalName: 'message'
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

export const Proto3Message = {
    new: (params: GetNewParams<Proto3Message>): Proto3Message => {
        return {
            id: getRandomId(),
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
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    name: string
    fields: Proto3EnumField[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3Enum = {
    new: (params: GetNewParams<Proto3Enum>): Proto3Enum => {
        return {
            id: getRandomId(),
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
