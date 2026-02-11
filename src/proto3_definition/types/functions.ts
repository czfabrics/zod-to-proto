import type { PurgeUndefinedValues } from '#core/types/purge_undefined_values'
import type { CloneParams } from '#proto3_definition/types/clone'
import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { Proto3Extension } from '#proto3_definition/types/extension'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { type AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'
import { match } from 'ts-pattern'

export type Proto3RpcFunction = {
    internalName: 'rpc_function'
    clone(params: CloneParams<Proto3RpcFunction>): ReadOnlyProto3RpcFunction
    propagateTypePrefix(prefix: string): ReadOnlyProto3RpcFunction
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
    /**
     * @example 'GetUsers'
     */
    name: string
    // TODO: remplacer undefined par null car sinon on ne peut pas
    // distinguer le undefined du partial ou de ce type là
    typePrefix: string | undefined
    in: AnyProto3Message | Proto3ImportedType
    inStream: boolean
    out: AnyProto3Message | Proto3ImportedType
    outStream: boolean
    extensions: Proto3Extension[]
    comments: string[]
}
export type ReadOnlyProto3RpcFunction = DeepReadOnly<Proto3RpcFunction>

export const Proto3RpcFunction = {
    new: function (params: GetNewParams<Proto3RpcFunction>): ReadOnlyProto3RpcFunction {
        return {
            internalName: 'rpc_function',
            clone(
                this: ReadOnlyProto3RpcFunction,
                params: PurgeUndefinedValues<CloneParams<Proto3RpcFunction>>
            ): ReadOnlyProto3RpcFunction {
                return {
                    ...this,
                    ...params,
                }
            },
            propagateTypePrefix(
                this: ReadOnlyProto3RpcFunction,
                prefix: string
            ): ReadOnlyProto3RpcFunction {
                const newIn = match(params.in)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (message) => {
                            if (this.typePrefix === undefined) {
                                return message.addPrefix(prefix)
                            }

                            return message.addPrefix(this.typePrefix).addPrefix(prefix)
                        }
                    )
                    .with({ internalName: 'imported_type' }, (type) => type)
                    .exhaustive()

                const newOut = match(params.out)
                    .with(
                        { internalName: 'message' },
                        { internalName: 'enum' },
                        (message) => {
                            if (this.typePrefix === undefined) {
                                return message.addPrefix(prefix)
                            }

                            return message.addPrefix(this.typePrefix).addPrefix(prefix)
                        }
                    )
                    .with({ internalName: 'imported_type' }, (type) => type)
                    .exhaustive()

                return this.clone({
                    in: newIn,
                    out: newOut,
                })
            },
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
            ...params,
        }
    },
} as const
