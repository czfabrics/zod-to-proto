import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { Proto3RpcFunction } from '#proto3_definition/types/functions'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3RpcService = {
    internalName: 'rpc_service'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    applyTypePrefix(): void
    /**
     * @example 'UserService'
     */
    name: string
    typePrefix: string | undefined
    functions: Proto3RpcFunction[]
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3RpcService = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3RpcService>>>(
        params: TParams
    ) {
        return {
            internalName: 'rpc_service',
            getDeepMessages() {
                return this.functions
                    .map((rpcFunction) => rpcFunction.getDeepMessages())
                    .flat()
            },
            getDeepImportedTypes() {
                return this.functions
                    .map((rpcFunction) => rpcFunction.getDeepImportedTypes())
                    .flat()
            },
            applyTypePrefix() {
                for (const rpcFunction of this.functions) {
                    rpcFunction.applyTypePrefix()
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
            },
            ...params,
        } as const satisfies DeepReadOnly<Proto3RpcService>
    },
} as const
