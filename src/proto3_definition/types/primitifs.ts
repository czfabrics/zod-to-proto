import { Proto3MessageField } from '#proto3_definition/types/fields'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import type { WithInternalName } from '#proto3_definition/types/with_internal_name'
import type { ZodType } from 'zod'
import { SomeType } from 'zod/v4/core'

// TODO: nom scalar type
type Proto3Primitifs = {
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

export type Proto3PrimitifType = {
    [TKey in keyof Proto3Primitifs]: {
        internalName: Lowercase<TKey>
        name: Proto3Primitifs[TKey]
        schema: SomeType
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
    }
}[keyof Proto3Primitifs]

// TODO: si on met 2 fois la meme value le checkTuple passe lol
// tuple

export type Proto3RepeatedInnerType =
    | AnyProto3Message
    | Proto3ImportedType
    | Proto3PrimitifType
    | WithInternalName<Proto3ComplexPrimitifs, 'REPEATED'>

export type Proto3MapValueType =
    | AnyProto3Message
    | Proto3ImportedType
    | Proto3PrimitifType

type Proto3ComplexPrimitifs = {
    MAP: {
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
        key: Proto3PrimitifType
        value: Proto3MapValueType
        schema: ZodType
    }
    REPEATED: {
        getDeepMessages(): AnyProto3Message[]
        getDeepImportedTypes(): Proto3ImportedType[]
        getDeepOptionalMessageFields(): Proto3MessageField[]
        inner: Proto3RepeatedInnerType
        schema: ZodType
    }
}

export type Proto3ComplexPrimitifType = {
    [TKey in keyof Proto3ComplexPrimitifs]: WithInternalName<Proto3ComplexPrimitifs, TKey>
}[keyof Proto3ComplexPrimitifs]

export type AnyProto3PrimitifType = Proto3ComplexPrimitifType | Proto3PrimitifType
