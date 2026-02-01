import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3RpcFunction = {
    internalName: 'rpc_function'
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    applyTypePrefix(): void
    /**
     * @example 'GetUsers'
     */
    name: string
    typePrefix: string | undefined
    in: AnyProto3Message | Proto3ImportedType
    inStream: boolean
    out: AnyProto3Message | Proto3ImportedType
    outStream: boolean
    extensions: Proto3Extension[]
    comments: string[]
}

export const Proto3RpcFunction = {
    new: function <const TParams extends DeepReadOnly<GetNewParams<Proto3RpcFunction>>>(
        params: TParams
    ) {
        return {
            internalName: 'rpc_function',
            getDeepMessages() {
                return [...this.in.getDeepMessages(), ...this.out.getDeepMessages()]
            },
            getDeepImportedTypes() {
                return [
                    ...this.in.getDeepImportedTypes(),
                    ...this.out.getDeepImportedTypes(),
                    ...this.extensions.map((extension) =>
                        extension.getDeepImportedTypes()
                    ),
                ].flat()
            },
            applyTypePrefix() {
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
        }
        } as const satisfies DeepReadOnly<Proto3RpcFunction>
    },
} as const
