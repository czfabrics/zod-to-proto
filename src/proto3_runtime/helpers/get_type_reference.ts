import type { ReadOnlyProto3MessageFieldType } from '#proto3_definition/types/fields'
import { match } from 'ts-pattern'

export const getTypeReference = function (item: ReadOnlyProto3MessageFieldType): string {
    return match(item)
        .returnType<string>()
        .with(
            { internalName: 'string' },
            { internalName: 'bool' },
            { internalName: 'int32' },
            { internalName: 'int64' },
            { internalName: 'uint32' },
            { internalName: 'uint64' },
            { internalName: 'sint32' },
            { internalName: 'sint64' },
            { internalName: 'fixed32' },
            { internalName: 'fixed64' },
            { internalName: 'sfixed32' },
            { internalName: 'sfixed64' },
            { internalName: 'float' },
            { internalName: 'double' },
            { internalName: 'bytes' },
            (scalarType) => scalarType.name
        )
        .with({ internalName: 'message' }, { internalName: 'enum' }, (message) => {
            return message.name
        })
        .with({ internalName: 'imported_type' }, (imported) => {
            //// the leading dot makes the reference absolute, so protobufjs looks the type up
            //// at the root it was added to rather than from the enclosing package
            return `.${imported.typeReference}`
        })
        .with({ internalName: 'repeated' }, (repeated) => {
            return getTypeReference(repeated.getDeepInnerType())
        })
        .with({ internalName: 'map' }, (map) => {
            return getTypeReference(map.value)
        })
        .exhaustive()
}
