import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3GlobalType } from '#proto3_definition/types/types'

export const Proto3Deprecated = {
    useType: function () {
        return Proto3GlobalType.new({
            typeReference: 'deprecated',
        })
    },
    useExtension: function (value: boolean) {
        return Proto3Extension.new({
            key: this.useType(),
            value,
        })
    },
} as const
