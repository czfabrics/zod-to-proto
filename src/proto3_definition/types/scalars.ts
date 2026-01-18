import { Proto3MessageField } from '#proto3_definition/types/fields'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { SomeType } from 'zod/v4/core'

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

export type Proto3ScalarType = {
    [TKey in keyof Proto3ScalarRawTypes]: {
        internalName: Lowercase<TKey>
        name: Proto3ScalarRawTypes[TKey]
        schema: SomeType
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
    }
}[keyof Proto3ScalarRawTypes]
