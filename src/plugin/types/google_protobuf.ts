import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export const Proto3Empty = {
    useType: () => {
        return Proto3ImportedType.new({
            importPath: 'google/protobuf/empty.proto',
            typeReference: 'google.protobuf.Empty',
        })
    },
} as const
