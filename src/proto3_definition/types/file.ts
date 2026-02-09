import { Proto3Extension } from '#proto3_definition/types/extension'
import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3File = {
    internalName: 'file'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    applyTypePrefix(): void
    syntax: 'proto3'
    /**
     * @example 'services.authentification.v1'
     */
    packageName: string
    typePrefix: string | undefined
    services: Proto3RpcService[]
    unscopedMessages: AnyProto3Message[]
    extensions: Proto3Extension[]
}

export const Proto3File = {
    new: (params: GetNewParams<Proto3File>): Proto3File => {
        return {
            internalName: 'file',
            getDeepMessages() {
                return [
                    ...this.services.map((service) => service.getDeepMessages()),
                    ...this.unscopedMessages.map((message) => message.getDeepMessages()),
                ].flat()
            },
            getDeepImportedTypes() {
                return [
                    ...this.services.map((service) => service.getDeepImportedTypes()),
                    ...this.unscopedMessages.map((message) =>
                        message.getDeepImportedTypes()
                    ),
                ].flat()
            },
            applyTypePrefix() {
                for (const service of this.services) {
                    service.applyTypePrefix()
                }

                if (this.typePrefix === undefined) {
                    return
                }

                const messages = this.getDeepMessages().reduceRight(
                    (accumulator, message) => {
                        const isMessageAlreadyPresent = accumulator.findIndex(
                            (accMessage) => accMessage.id === message.id
                        )

                        if (isMessageAlreadyPresent >= 0) {
                            return accumulator
                        }

                        return [...accumulator, message]
                    },
                    [] as AnyProto3Message[]
                )

                for (const message of messages) {
                    message.name = `${this.typePrefix}${message.name}`
                }

                for (const service of this.services) {
                    service.name = `${this.typePrefix}${service.name}`
                }
            },
            ...params,
        }
    },
} as const
