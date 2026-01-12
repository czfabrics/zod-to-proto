import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'

export const Proto3ValidateFieldAnnotation = {
    useType: () => {
        return Proto3ImportedType.new({
            importPath: 'buf/validate/validate.proto',
            typeReference: 'buf.validate.field',
        })
    },
    useExtension: (value: { required?: boolean }) => {
        return Proto3Extension.new({
            key: Proto3ValidateFieldAnnotation.useType(),
            value,
        })
    },
} as const
