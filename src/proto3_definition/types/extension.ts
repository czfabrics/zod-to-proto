import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Type, type Proto3ImportedType } from '#proto3_definition/types/types'

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
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3Extension>>>(
        params: TParams
    ) {
        return {
            internalName: 'extension',
            getDeepImportedTypes() {
                return this.key.getDeepImportedTypes()
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3Extension>
    },
} as const
