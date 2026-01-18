import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Type, Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3ExtensionScalarValue = string | number | boolean
export type Proto3ExtensionRepeatedValue = (
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
    | undefined
)[]
export type Proto3ExtensionMessageValue = {
    [key: string]:
        | Proto3ExtensionScalarValue
        | Proto3ExtensionMessageValue
        | Proto3ExtensionRepeatedValue
        | undefined
}

export type AnyProto3ExtensionValue =
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
    | Proto3ExtensionRepeatedValue
    | undefined

export type Proto3Extension = {
    internalName: 'extension'
    getDeepImportedTypes(): Proto3ImportedType[]
    //// TODO: handle extend keyword (custom extension)
    key: AnyProto3Type
    value: AnyProto3ExtensionValue
}

export const Proto3Extension = {
    new: function <const TParams extends GetNewParams<Proto3Extension>>(params: TParams) {
        return {
            internalName: 'extension',
            getDeepImportedTypes() {
                return this.key.getDeepImportedTypes()
            },
            ...params,
        } as const satisfies Proto3Extension
    },
    simplify: function (extension: Proto3Extension): Proto3Extension {
        if (typeof extension.value !== 'object' || Array.isArray(extension.value)) {
            return extension
        }

        const messageEntries = Object.entries(extension.value)

        if (messageEntries.length < 1 || messageEntries.length > 1) {
            return extension
        }

        const firstKey = messageEntries[0]![0]
        const firstValue = messageEntries[0]![1]

        return this.new({
            ...extension,
            key: AnyProto3Type.new({
                ...extension.key,
                typeReference: `(${extension.key.typeReference}).${firstKey}`,
            }),
            value: firstValue,
        })
    },
} as const
