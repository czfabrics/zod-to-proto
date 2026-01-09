import { Proto3MessageField } from '#proto3_definition/types/fields'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'

export type Proto3File = {
    internalName: 'file'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    packageName: string
    syntax: 'proto3'
    service: Proto3RpcService
    forcesOptionalEverywhere: boolean
}

export const Proto3File = {
    new: (params: GetNewParams<Proto3File>): Proto3File => {
        return {
            internalName: 'file',
            getDeepMessages() {
                return this.service.getDeepMessages()
            },
            getDeepImportedTypes() {
                return this.service.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                return this.service.getDeepOptionalMessageFields()
            },
            ...params,
        }
    },
} as const
