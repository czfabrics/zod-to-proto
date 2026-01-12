import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3GlobalType } from '#proto3_definition/types/types'

export const Proto3Deprecated = {
    useType: () => {
        return Proto3GlobalType.new({
            typeReference: 'deprecated',
        })
    },
    useExtension: (value: boolean) => {
        return Proto3Extension.new({
            key: Proto3Deprecated.useType(),
            value,
        })
    },
} as const
