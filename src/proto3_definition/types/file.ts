import type { ReadOnly } from '#core/types/read_only'
import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { ReadOnlyProto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3RpcService } from '#proto3_definition/types/service'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'

export type Proto3File = {
    internalName: 'file'
    clone(params: CloneParams<Proto3File>): ReadOnlyProto3File
    propagateTypePrefix(): ReadOnlyProto3File
    getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
    getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
    syntax: 'proto3'
    /**
     * @example 'services.authentification.v1'
     */
    packageName: string
    typePrefix: string | null
    services: readonly ReadOnlyProto3RpcService[]
    unscopedMessages: readonly ReadOnlyAnyProto3Message[]
    extensions: readonly ReadOnlyProto3Extension[]
}
export type ReadOnlyProto3File = ReadOnly<Proto3File>

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
            propagateTypePrefix(this: ReadOnlyProto3File): ReadOnlyProto3File {
                const typePrefix = this.typePrefix

                if (typePrefix === null) {
                    return this
                }

                const newServices = this.services.map((service) => {
                    return service.propagateTypePrefix([typePrefix])
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
