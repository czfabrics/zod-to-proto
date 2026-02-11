import { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import { GetAnyNewParams, GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { match } from 'ts-pattern'

export type Proto3GlobalType = {
    internalName: 'global_type'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    typeReference: string
}
export type ReadOnlyProto3GlobalType = DeepReadOnly<Proto3GlobalType>

export const Proto3GlobalType = {
    new: function (params: GetNewParams<Proto3GlobalType>): ReadOnlyProto3GlobalType {
        return {
            internalName: 'global_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            ...params,
        }
    },
} as const

export type Proto3ImportedType = {
    internalName: 'imported_type'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    importPath: string
    typeReference: string
}
export type ReadOnlyProto3ImportedType = DeepReadOnly<Proto3ImportedType>

export const Proto3ImportedType = {
    new: function (params: GetNewParams<Proto3ImportedType>): ReadOnlyProto3ImportedType {
        return {
            internalName: 'imported_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return [this]
            },
            ...params,
        }
    },
} as const

export type AnyProto3Type = Proto3GlobalType | Proto3ImportedType
export type ReadOnlyAnyProto3Type = DeepReadOnly<AnyProto3Type>

export const AnyProto3Type = {
    new: function (
        params: GetAnyNewParams<Proto3GlobalType> | GetAnyNewParams<Proto3ImportedType>
    ): ReadOnlyAnyProto3Type {
        return match(params)
            .with({ internalName: 'global_type' }, (params) =>
                Proto3GlobalType.new(params)
            )
            .with({ internalName: 'imported_type' }, (params) =>
                Proto3ImportedType.new(params)
            )
            .exhaustive()
    },
} as const
