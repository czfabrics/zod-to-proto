import { Proto3EnumField, Proto3MessageField } from '#proto3_definition/types/fields'
import { Proto3Enum, Proto3Message } from '#proto3_definition/types/messages'
import { Proto3StringType } from '#proto3_definition/types/scalar_standalones'
import { Proto3RuntimeAnyMessageResolver } from '#proto3_runtime/classes/proto3_runtime_any_message_resolver'
import * as protobuf from 'protobufjs'
import { describe, test } from 'vitest'

describe('`Proto3RuntimeAnyMessageResolver` test suite', () => {
    test('Testing that a message resolves to a type', async ({ expect }) => {
        const resolver = new Proto3RuntimeAnyMessageResolver()

        const result = resolver.resolveType(
            Proto3Message.new({
                name: 'User',
                fields: [
                    Proto3MessageField.new({
                        key: 'full_name',
                        index: 1,
                        optionalState: 'NONE',
                        type: Proto3StringType.new(),
                        extensions: [],
                        comments: [],
                    }),
                ],
                extensions: [],
                comments: [],
            })
        )

        expect(result).toBeInstanceOf(protobuf.Type)
        expect(result.toJSON()).toStrictEqual({
            fields: { full_name: { id: 1, type: 'string' } },
        })
    })

    test('Testing that an enum resolves to an enum', async ({ expect }) => {
        const resolver = new Proto3RuntimeAnyMessageResolver()

        const result = resolver.resolveType(
            Proto3Enum.new({
                name: 'UserRole',
                fields: [
                    Proto3EnumField.new({
                        key: 'ADMIN',
                        index: 0,
                        extensions: [],
                        comments: [],
                    }),
                ],
                extensions: [],
                comments: [],
            })
        )

        expect(result).toBeInstanceOf(protobuf.Enum)
        expect(result.toJSON()).toStrictEqual({ values: { ADMIN: 0 } })
    })
})
