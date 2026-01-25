import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3MessageField } from '#proto3_definition/types/fields'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3File = {
    internalName: 'file'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    getDeepOptionalMessageFields(): Proto3MessageField[]
    /**
     * @example 'services.authentification.v1'
     */
    packageName: string
    syntax: 'proto3'
    service: Proto3RpcService | undefined
    unscopedMessages: AnyProto3Message[]
    extensions: Proto3Extension[]
}

export const Proto3File = {
    new: (params: GetNewParams<Proto3File>): Proto3File => {
        return {
            internalName: 'file',
            getDeepMessages() {
                return [
                    ...(this.service?.getDeepMessages() ?? []),
                    ...this.unscopedMessages.map((message) => message.getDeepMessages()),
                ].flat()
            },
            getDeepImportedTypes() {
                return [
                    ...(this.service?.getDeepImportedTypes() ?? []),
                    ...this.unscopedMessages.map((message) =>
                        message.getDeepImportedTypes()
                    ),
                ].flat()
            },
            getDeepOptionalMessageFields() {
                return [
                    ...(this.service?.getDeepOptionalMessageFields() ?? []),
                    ...this.unscopedMessages.map((message) =>
                        message.getDeepOptionalMessageFields()
                    ),
                ].flat()
            },
            ...params,
        }
    },
} as const
