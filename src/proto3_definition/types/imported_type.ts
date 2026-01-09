import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'

export type Proto3ImportedType = {
    internalName: 'imported'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    importPath: string
    typeReference: string
}

export const Proto3ImportedType = {
    new: (params: GetNewParams<Proto3ImportedType>): Proto3ImportedType => {
        return {
            internalName: 'imported',
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
