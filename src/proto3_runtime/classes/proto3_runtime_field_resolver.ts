import type {
    ReadOnlyProto3MessageField,
    ReadOnlyProto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import { Proto3RuntimeDynamicSizeFieldResolver } from '#proto3_runtime/classes/proto3_runtime_dynamic_size_field_resolver'
import { Proto3RuntimeScalarFieldResolver } from '#proto3_runtime/classes/proto3_runtime_scalar_field_resolver'
import type * as protobuf from 'protobufjs'
import { match } from 'ts-pattern'

export class Proto3RuntimeFieldResolver {
    private readonly scalarFieldResolver = new Proto3RuntimeScalarFieldResolver()
    private readonly dynamicSizeFieldResolver =
        new Proto3RuntimeDynamicSizeFieldResolver()

    private isDynamicSize(field: protobuf.Field): boolean {
        return field.map || field.repeated
    }

    public resolveType(
        field: ReadOnlyProto3MessageField | ReadOnlyProto3MessageOneOfFieldSubField
    ): protobuf.Field | protobuf.MapField {
        return match(field.type)
            .returnType<protobuf.Field | protobuf.MapField>()
            .with({ internalName: 'map' }, { internalName: 'repeated' }, (type) => {
                return this.dynamicSizeFieldResolver.resolveType(field, type)
            })
            .otherwise(() => this.scalarFieldResolver.resolveType(field))
    }

    public getAbsentValue(field: protobuf.Field): unknown {
        if (this.isDynamicSize(field)) {
            return this.dynamicSizeFieldResolver.getAbsentValue(field)
        }

        return this.scalarFieldResolver.getAbsentValue(field)
    }

    public resolveProtoField(field: protobuf.Field, value: unknown): unknown {
        if (this.isDynamicSize(field)) {
            return this.dynamicSizeFieldResolver.resolveProtoField(field, value)
        }

        return this.scalarFieldResolver.resolveProtoValue(field, value)
    }

    public resolveJsField(field: protobuf.Field, value: unknown): unknown {
        if (this.isDynamicSize(field)) {
            return this.dynamicSizeFieldResolver.resolveJsField(field, value)
        }

        return this.scalarFieldResolver.resolveJsValue(field, value)
    }
}
