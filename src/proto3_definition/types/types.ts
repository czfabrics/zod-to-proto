import { Proto3MessageField } from '#proto3_definition/types/fields'
import { GetAnyNewParams, GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { match } from 'ts-pattern'

export type Proto3GlobalType = {
    internalName: 'global_type'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    typeReference: string
}

export const Proto3GlobalType = {
    new: <const TParams extends GetNewParams<Proto3GlobalType>>(params: TParams) => {
        return {
            internalName: 'global_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
            ...params,
        } as const satisfies Proto3GlobalType
    },
} as const

export type Proto3ImportedType = {
    internalName: 'imported_type'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    importPath: string
    typeReference: string
}

export const Proto3ImportedType = {
    new: <const TParams extends GetNewParams<Proto3ImportedType>>(params: TParams) => {
        return {
            internalName: 'imported_type',
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return [this]
            },
            getDeepOptionalMessageFields() {
                return []
            },
            ...params,
        } as const satisfies Proto3ImportedType
    },
} as const

export type AnyProto3Type = Proto3GlobalType | Proto3ImportedType

export const AnyProto3Type = {
    new: (
        params: GetAnyNewParams<Proto3GlobalType> | GetAnyNewParams<Proto3ImportedType>
    ) => {
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
