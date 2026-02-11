import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3RpcService } from '#proto3_definition/types/service'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export type Proto3File = {
    internalName: 'file'
    clone(params: CloneParams<Proto3File>): Proto3File
    propagateTypePrefix(prefix: string): Proto3File
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
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
export type ReadOnlyProto3File = DeepReadOnly<Proto3File>

export const Proto3File = {
    new: function (params: GetNewParams<Proto3File>): ReadOnlyProto3File {
        return {
            internalName: 'file',
            clone(
                this: ReadOnlyProto3File,
                params: PurgeUndefinedValues<CloneParams<Proto3File>>
            ): ReadOnlyProto3File {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3File,
                prefix: string
            ): ReadOnlyProto3File {
                const newServices = this.services.map((service) => {
                    if (this.typePrefix !== undefined) {
                        return service
                            .propagateTypePrefix(this.typePrefix)
                            .propagateTypePrefix(prefix)
                    }

                    return service.propagateTypePrefix(prefix)
                })

                return this.clone({
                    services: newServices,
                })
            },
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
            ...params,
        }
    },
} as const
