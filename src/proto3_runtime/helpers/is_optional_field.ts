import type * as protobuf from 'protobufjs'

export const isOptionalField = function (field: protobuf.Field): boolean {
    return field.options?.['proto3_optional'] === true
}
