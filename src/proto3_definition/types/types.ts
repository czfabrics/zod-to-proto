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

export const Proto3GlobalType = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3GlobalType>>>(
        params: TParams
    ) {
        return {
            internalName: 'global_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3GlobalType>
    },
} as const

export type Proto3ImportedType = {
    internalName: 'imported_type'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    importPath: string
    typeReference: string
}

export const Proto3ImportedType = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3ImportedType>>>(
        params: TParams
    ) {
        return {
            internalName: 'imported_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return [this]
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3ImportedType>
    },
} as const

export type AnyProto3Type = Proto3GlobalType | Proto3ImportedType

export const AnyProto3Type = {
    new: function (
        params:
            | DeepReadOnly<GetAnyNewParams<Proto3GlobalType>>
            | DeepReadOnly<GetAnyNewParams<Proto3ImportedType>>
    ) {
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
