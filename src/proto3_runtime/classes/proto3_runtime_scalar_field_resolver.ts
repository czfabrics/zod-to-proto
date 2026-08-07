import type {
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import { getTypeReference } from '#proto3_runtime/helpers/get_type_reference'
import { isOptionalField } from '#proto3_runtime/helpers/is_optional_field'
import type { Proto3RuntimeLongValue } from '#proto3_runtime/types/codec'
import * as protobuf from 'protobufjs'
const LONG_FIELD_TYPES = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'] as const

export class Proto3RuntimeScalarFieldResolver {
    public resolveType(
        field: ReadOnlyProto3MessageField | ReadOnlyProto3MessageOneOfFieldSubField
    ): protobuf.Field {
        const typeReference = getTypeReference(field.type)

        if (field.optionalState === 'PRESENT') {
            return new protobuf.Field(
                field.key,
                field.index,
                typeReference,
                undefined,
                undefined,
                { proto3_optional: true }
            )
        }

        return new protobuf.Field(field.key, field.index, typeReference)
    }

    public getAbsentValue(field: protobuf.Field): unknown {
        if (isOptionalField(field)) {
            return undefined
        }

        if (field.resolvedType instanceof protobuf.Enum) {
            return field.resolvedType.valuesById[0] ?? 0
        }

        if (field.resolvedType instanceof protobuf.Type) {
            return undefined
        }

        if (field.type === 'string') {
            return ''
        }

        if (field.type === 'bool') {
            return false
        }

        if (field.type === 'bytes') {
            return new Uint8Array()
        }

        return 0
    }

    private isLongField(field: protobuf.Field): boolean {
        return LONG_FIELD_TYPES.some((longType) => longType === field.type)
    }

    private isLongValue(value: unknown): value is Proto3RuntimeLongValue {
        return (
            typeof value === 'object' &&
            value !== null &&
            'toNumber' in value &&
            typeof value.toNumber === 'function'
        )
    }

    private resolveProtoEnumValue(
        field: protobuf.Field,
        enumType: protobuf.Enum,
        name: string
    ): number {
        const value = enumType.values[name]

        if (value === undefined) {
            const names = Object.keys(enumType.values).join(', ')

            throw new Error(
                `Cannot encode "${name}" for the enum field "${field.name}": expected one of [${names}]`
            )
        }

        return value
    }

    public resolveProtoValue(field: protobuf.Field, value: unknown): unknown {
        if (field.resolvedType instanceof protobuf.Enum && typeof value === 'string') {
            return this.resolveProtoEnumValue(field, field.resolvedType, value)
        }

        return value
    }

    private resolveJsEnumValue(enumType: protobuf.Enum, value: number): string | number {
        //// proto3 enums stay open, so a value absent from the schema is legitimate and kept as is
        return enumType.valuesById[value] ?? value
    }

    private resolveJsLongValue(value: Proto3RuntimeLongValue): number {
        return value.toNumber()
    }

    public resolveJsValue(field: protobuf.Field, value: unknown): unknown {
        if (field.resolvedType instanceof protobuf.Enum) {
            if (typeof value !== 'number') {
                return value
            }

            return this.resolveJsEnumValue(field.resolvedType, value)
        }

        if (!this.isLongField(field)) {
            return value
        }

        //// z.int() and z.int64() both convert to int64, so bigint fields lose precision past 2^53
        if (this.isLongValue(value)) {
            return this.resolveJsLongValue(value)
        }

        return value
    }
}
