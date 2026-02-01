import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3RpcService } from '#proto3_definition/types/service'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

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
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3File>>>(
        params: TParams
    ) {
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
        } as const satisfies DeepReadOnly<Proto3File>
    },
} as const
