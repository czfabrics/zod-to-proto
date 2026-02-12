import { DeepReadOnly, ReadOnlyValue } from '#proto3_definition/types/deep_read_only'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

type Proto3ScalarRawTypes = {
    STRING: 'string'
    BOOL: 'bool'
    INT32: 'int32'
    INT64: 'int64'
    UINT32: 'uint32'
    UINT64: 'uint64'
    SINT32: 'sint32'
    SINT64: 'sint64'
    FIXED32: 'fixed32'
    FIXED64: 'fixed64'
    SFIXED32: 'sfixed32'
    SFIXED64: 'sfixed64'
    DOUBLE: 'double'
    FLOAT: 'float'
    BYTES: 'bytes'
}

type Proto3ScalarTypeName = Proto3ScalarRawTypes[keyof Proto3ScalarRawTypes]

type SomeProto3ScalarType<TName extends Proto3ScalarTypeName = Proto3ScalarTypeName> = {
    internalName: TName
    name: TName
    getDeepMessages(): AnyProto3Message[]
    getDeepImportedTypes(): Proto3ImportedType[]
}
export type ReadOnlySomeProto3ScalarType<
    TName extends Proto3ScalarTypeName = Proto3ScalarTypeName,
> = DeepReadOnly<SomeProto3ScalarType<TName>>

export type Proto3ScalarType = {
    [TKey in keyof Proto3ScalarRawTypes]: SomeProto3ScalarType<Proto3ScalarRawTypes[TKey]>
}[keyof Proto3ScalarRawTypes]
export type ReadOnlyProto3ScalarType = DeepReadOnly<Proto3ScalarType>

export const Proto3ScalarType = {
    new: function <TName extends Proto3ScalarTypeName>(
        name: ReadOnlyValue<TName>
    ): ReadOnlySomeProto3ScalarType<TName> {
        return {
            internalName: name,
            name: name,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
        }
    },
} as const
