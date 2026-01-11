import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export type Proto3ExtensionScalarValue = string | number | boolean
export type Proto3ExtensionRepeatedValue = (
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
)[]
export type Proto3ExtensionMessageValue = {
    [key: string]:
        | Proto3ExtensionScalarValue
        | Proto3ExtensionMessageValue
        | Proto3ExtensionRepeatedValue
}

export type AnyProto3ExtensionValue =
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
    | Proto3ExtensionRepeatedValue

export type Proto3Extension = {
    internalName: 'extension'
    getDeepImportedTypes(): Proto3ImportedType[]
    //// TODO: handle extend keyword (custom extension)
    key: Proto3ImportedType
    value: AnyProto3ExtensionValue
}

export const Proto3Extension = {
    new: (params: GetNewParams<Proto3Extension>): Proto3Extension => {
        return {
            internalName: 'extension',
            getDeepImportedTypes() {
                return [this.key]
            },
            ...params,
        }
    },
} as const
