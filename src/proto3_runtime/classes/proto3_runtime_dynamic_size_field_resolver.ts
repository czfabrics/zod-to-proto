import type { UnknownRecord } from '#core/types/unknown_record'
import type { ReadOnlyProto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type {
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import { Proto3RuntimeScalarFieldResolver } from '#proto3_runtime/classes/proto3_runtime_scalar_field_resolver'
import { makeNotDynamicSizeError } from '#proto3_runtime/factories/make_not_dynamic_size_error'
import { getTypeReference } from '#proto3_runtime/helpers/get_type_reference'
import { isUnknownRecord } from '#proto3_runtime/helpers/is_unknown_record'
import * as protobuf from 'protobufjs'
import { match } from 'ts-pattern'

export class Proto3RuntimeDynamicSizeFieldResolver {
    private readonly scalarFieldResolver = new Proto3RuntimeScalarFieldResolver()

    public resolveType(
        field: ReadOnlyProto3MessageField | ReadOnlyProto3MessageOneOfFieldSubField,
        type: ReadOnlyProto3DynamicSizeType
    ): protobuf.Field | protobuf.MapField {
        return match(type)
            .returnType<protobuf.Field | protobuf.MapField>()
            .with({ internalName: 'map' }, (map) => {
                return new protobuf.MapField(
                    field.key,
                    field.index,
                    getTypeReference(map.key),
                    getTypeReference(map.value)
                )
            })
            .with({ internalName: 'repeated' }, (repeated) => {
                return new protobuf.Field(
                    field.key,
                    field.index,
                    getTypeReference(repeated.getDeepInnerType()),
                    'repeated'
                )
            })
            .exhaustive()
    }

    public getAbsentValue(field: protobuf.Field): unknown {
        if (field.map) {
            return {}
        }

        if (field.repeated) {
            return []
        }

        throw makeNotDynamicSizeError(field)
    }

    private resolveProtoMap(field: protobuf.Field, value: UnknownRecord): UnknownRecord {
        const entries = Object.entries(value).map(([key, entryValue]) => [
            key,
            this.scalarFieldResolver.resolveProtoValue(field, entryValue),
        ])

        return Object.fromEntries(entries)
    }

    private resolveProtoList(
        field: protobuf.Field,
        value: readonly unknown[]
    ): unknown[] {
        return value.map((item) =>
            this.scalarFieldResolver.resolveProtoValue(field, item)
        )
    }

    public resolveProtoField(field: protobuf.Field, value: unknown): unknown {
        if (field.map) {
            if (!isUnknownRecord(value)) {
                throw new Error(
                    `Cannot encode the map field "${field.name}": expected an object`
                )
            }

            return this.resolveProtoMap(field, value)
        }

        if (field.repeated) {
            if (!Array.isArray(value)) {
                throw new Error(
                    `Cannot encode the repeated field "${field.name}": expected an array`
                )
            }

            return this.resolveProtoList(field, value)
        }

        throw makeNotDynamicSizeError(field)
    }

    private resolveJsMap(field: protobuf.Field, value: UnknownRecord): UnknownRecord {
        const entries = Object.entries(value).map(([key, entryValue]) => [
            key,
            this.scalarFieldResolver.resolveJsValue(field, entryValue),
        ])

        return Object.fromEntries(entries)
    }

    private resolveJsList(field: protobuf.Field, value: readonly unknown[]): unknown[] {
        return value.map((item) => this.scalarFieldResolver.resolveJsValue(field, item))
    }

    public resolveJsField(field: protobuf.Field, value: unknown): unknown {
        if (field.map) {
            if (!isUnknownRecord(value)) {
                throw new Error(
                    `Cannot decode the map field "${field.name}": expected an object`
                )
            }

            return this.resolveJsMap(field, value)
        }

        if (field.repeated) {
            if (!Array.isArray(value)) {
                throw new Error(
                    `Cannot decode the repeated field "${field.name}": expected an array`
                )
            }

            return this.resolveJsList(field, value)
        }

        throw makeNotDynamicSizeError(field)
    }
}
