import { Proto3EnumField } from '#proto3_definition/types/fields'
import { Proto3Enum } from '#proto3_definition/types/messages'
import { Proto3RuntimeEnumResolver } from '#proto3_runtime/classes/proto3_runtime_enum_resolver'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

const getUserRoleEnum = function () {
    return Proto3Enum.new({
        name: 'UserRole',
        fields: [
            Proto3EnumField.new({
                key: 'ADMIN',
                index: 0,
                extensions: [],
                comments: [],
            }),
            Proto3EnumField.new({
                key: 'VIEWER',
                index: 1,
                extensions: [],
                comments: [],
            }),
        ],
        extensions: [],
        comments: [],
    })
}

describe('`Proto3RuntimeEnumResolver` test suite', () => {
    test('Testing an enum', async ({ expect }) => {
        const resolver = new Proto3RuntimeEnumResolver()

        const result = resolver.resolveType(getUserRoleEnum())

        expect(result).toBeInstanceOf(protobuf.Enum)
        expect(result.name).toBe('UserRole')
        expect(result.toJSON()).toStrictEqual({ values: { ADMIN: 0, VIEWER: 1 } })
    })

    test('Testing that the enum keeps the proto3 edition', async ({ expect }) => {
        const resolver = new Proto3RuntimeEnumResolver()

        const root = new protobuf.Root()

        root.define('demo.v1').add(resolver.resolveType(getUserRoleEnum()))
        root.resolveAll()

        //// a proto2 enum would be closed and emit its edition in the descriptor
        expect(root.lookupEnum('demo.v1.UserRole').toJSON()).toStrictEqual({
            values: { ADMIN: 0, VIEWER: 1 },
        })
    })
})
