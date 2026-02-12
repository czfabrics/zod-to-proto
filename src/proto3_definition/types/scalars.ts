import type { ReadOnly } from '#core/types/read_only'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'

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
    getDeepMessages(): readonly ReadOnlyAnyProto3Message[]
    getDeepImportedTypes(): readonly ReadOnlyProto3ImportedType[]
}
export type ReadOnlySomeProto3ScalarType<
    TName extends Proto3ScalarTypeName = Proto3ScalarTypeName,
> = ReadOnly<SomeProto3ScalarType<TName>>

export type Proto3ScalarType = {
    [TKey in keyof Proto3ScalarRawTypes]: ReadOnlySomeProto3ScalarType<
        Proto3ScalarRawTypes[TKey]
    >
}[keyof Proto3ScalarRawTypes]
// TODO: sert plutôt à rien, retirer les types ReadOnly pour
// tout mettre par défaut à readonly
export type ReadOnlyProto3ScalarType = Proto3ScalarType

export const Proto3ScalarType = {
    new: function <TName extends Proto3ScalarTypeName>(
        name: TName
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
