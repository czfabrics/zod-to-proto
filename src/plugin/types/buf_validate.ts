import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3ImportedType } from '#proto3_definition/types/types'

export const Proto3ValidateFieldAnnotation = {
    useType: function () {
        return Proto3ImportedType.new({
            importPath: 'buf/validate/validate.proto',
            typeReference: 'buf.validate.field',
        })
    },
    useExtension: function (value: { required?: boolean }) {
        return Proto3Extension.new({
            key: this.useType(),
            value,
        })
    },
} as const

export const Proto3ValidateOneOfAnnotation = {
    useType: function () {
        return Proto3ImportedType.new({
            importPath: 'buf/validate/validate.proto',
            typeReference: 'buf.validate.oneof',
        })
    },
    useExtension: function (value: { required?: boolean }) {
        return Proto3Extension.new({
            key: this.useType(),
            value,
        })
    },
} as const
