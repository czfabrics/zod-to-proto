import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3ExtensionScalarValue = string | number | boolean | undefined
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
    new: <const TParams extends GetNewParams<Proto3Extension>>(params: TParams) => {
        return {
            internalName: 'extension',
            getDeepImportedTypes() {
                return this.key.getDeepImportedTypes()
            },
            ...params,
        } as const satisfies Proto3Extension
    },
} as const
