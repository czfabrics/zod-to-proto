import { Proto3MessageField } from '#proto3_definition/types/fields'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'

export type Proto3ImportedType = {
    internalName: 'imported'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    importPath: string
    typeReference: string
}

export const Proto3ImportedType = {
    new: <const TParams extends GetNewParams<Proto3ImportedType>>(params: TParams) => {
        return {
            internalName: 'imported',
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
