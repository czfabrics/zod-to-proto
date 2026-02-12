import type { ReadOnly } from '#core/types/read_only'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type {
    ReadOnlyAnyProto3Type,
    ReadOnlyProto3ImportedType,
} from '#proto3_definition/types/types'

export type Proto3ExtensionScalarValue = string | number | boolean
export type Proto3ExtensionRepeatedValue = readonly (
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
    | undefined
)[]
export type Proto3ExtensionMessageValue = {
    readonly [key: string]:
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
export type ReadOnlyAnyProto3ExtensionValue = ReadOnly<AnyProto3ExtensionValue>

export type Proto3Extension = {
    internalName: 'extension'
    getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
    //// TODO: handle extend keyword (custom extension)
    key: ReadOnlyAnyProto3Type
    value: ReadOnlyAnyProto3ExtensionValue
}
export type ReadOnlyProto3Extension = ReadOnly<Proto3Extension>

export const Proto3Extension = {
    new: function (params: GetNewParams<Proto3Extension>): ReadOnlyProto3Extension {
        return {
            internalName: 'extension',
            getDeepImportedTypes() {
                return this.key.getDeepImportedTypes()
            },
            ...params,
        }
    },
} as const
