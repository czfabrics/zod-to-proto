import { Proto3Empty } from '#plugin/types/google_protobuf'
import { Proto3MapType, Proto3RepeatedType } from '#proto3_definition/types/dynamic_size'
import {
    Proto3MessageField,
    Proto3MessageOneOfFieldSubField,
} from '#proto3_definition/types/fields'
import { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import {
    Proto3Int32Type,
    Proto3StringType,
} from '#proto3_definition/types/scalar_standalones'
import { Proto3RuntimeFieldResolver } from '#proto3_runtime/classes/proto3_runtime_field_resolver'
import type { ReadOnlyProto3MessageFieldType } from '#proto3_definition/types/fields'
import type { Proto3OptionalState } from '#proto3_definition/types/fields'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

const getField = function (
    type: ReadOnlyProto3MessageFieldType,
    index: number = 1,
    optionalState: Proto3OptionalState = 'NONE'
) {
    return Proto3MessageField.new({
        key: 'some_field',
        index,
        optionalState,
        type,
        extensions: [],
        comments: [],
    })
}

const getUserMessage = function () {
    return Proto3Message.new({
        name: 'User',
        fields: [],
        extensions: [],
        comments: [],
    })
}

describe('`Proto3RuntimeFieldResolver` test suite', () => {
    test('Testing a scalar field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const result = resolver.resolveType(getField(Proto3StringType.new()))

        expect(result).toBeInstanceOf(protobuf.Field)
        expect(result.name).toBe('some_field')
        expect(result.toJSON()).toStrictEqual({ id: 1, type: 'string' })
    })

    test('Testing an optional scalar field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const result = resolver.resolveType(
            getField(Proto3StringType.new(), 2, 'PRESENT')
        )

        expect(result.toJSON()).toStrictEqual({
            id: 2,
            type: 'string',
            options: { proto3_optional: true },
        })
    })

    test('Testing a message reference field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const result = resolver.resolveType(getField(getUserMessage()))

        expect(result.toJSON()).toStrictEqual({ id: 1, type: 'User' })
    })

    test('Testing an enum reference field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const userRole = Proto3Enum.new({
            name: 'UserRole',
            fields: [],
            extensions: [],
            comments: [],
        })

        const result = resolver.resolveType(getField(userRole))

        expect(result.toJSON()).toStrictEqual({ id: 1, type: 'UserRole' })
    })

    test('Testing an imported type field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const result = resolver.resolveType(getField(Proto3Empty.useType()))

        expect(result.toJSON()).toStrictEqual({ id: 1, type: '.google.protobuf.Empty' })
    })

    test('Testing a repeated field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const repeated = Proto3RepeatedType.new({ inner: Proto3StringType.new() })

        const result = resolver.resolveType(getField(repeated))

        expect(result.repeated).toBe(true)
        expect(result.toJSON()).toStrictEqual({ id: 1, rule: 'repeated', type: 'string' })
    })

    test('Testing a nested repeated field collapses to its deep inner type', async ({
        expect,
    }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const repeated = Proto3RepeatedType.new({
            inner: Proto3RepeatedType.new({ inner: Proto3Int32Type.new() }),
        })

        const result = resolver.resolveType(getField(repeated))

        expect(result.toJSON()).toStrictEqual({ id: 1, rule: 'repeated', type: 'int32' })
    })

    test('Testing a map field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const accessMessage = Proto3Message.new({
            name: 'Access',
            fields: [],
            extensions: [],
            comments: [],
        })

        const map = Proto3MapType.new({
            key: Proto3StringType.new(),
            value: accessMessage,
        })

        const result = resolver.resolveType(getField(map))

        expect(result).toBeInstanceOf(protobuf.MapField)
        expect(result.toJSON()).toStrictEqual({
            id: 1,
            keyType: 'string',
            type: 'Access',
        })
    })

    test('Testing a one of sub field', async ({ expect }) => {
        const resolver = new Proto3RuntimeFieldResolver()

        const subField = Proto3MessageOneOfFieldSubField.new({
            key: 'synchronize_users',
            index: 3,
            optionalState: 'NOT_NEEDED',
            type: getUserMessage(),
            extensions: [],
            comments: [],
        })

        const result = resolver.resolveType(subField)

        expect(result.name).toBe('synchronize_users')
        expect(result.toJSON()).toStrictEqual({ id: 3, type: 'User' })
    })
})
