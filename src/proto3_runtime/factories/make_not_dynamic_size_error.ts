import type * as protobuf from 'protobufjs'

export const makeNotDynamicSizeError = function (field: protobuf.Field): Error {
    return new Error(
        `Cannot convert the field "${field.name}": it is neither a map nor a repeated field`
    )
}
