import type { UnknownRecord } from '#core/types/unknown_record'
import type { ReadOnlyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RuntimeFieldResolver } from '#proto3_runtime/classes/proto3_runtime_field_resolver'
import { isUnknownRecord } from '#proto3_runtime/helpers/is_unknown_record'
import { pinProto3Edition } from '#proto3_runtime/helpers/pin_proto3_edition'
import { camelCase, snakeCase } from 'change-case'
import * as protobuf from 'protobufjs'

export class Proto3RuntimeMessageResolver {
    private readonly fieldResolver = new Proto3RuntimeFieldResolver()

    public resolveType(message: ReadOnlyProto3Message): protobuf.Type {
        const type = pinProto3Edition(new protobuf.Type(message.name))
        const oneofs: protobuf.OneOf[] = []

        for (const field of message.fields) {
            if (field.internalName === 'message_field') {
                type.add(this.fieldResolver.resolveType(field))

                continue
            }

            for (const subField of field.subFields) {
                type.add(this.fieldResolver.resolveType(subField))
            }

            oneofs.push(
                new protobuf.OneOf(
                    field.key,
                    field.subFields.map((subField) => subField.key)
                )
            )
        }

        //// a one of only binds the fields already added to its type
        for (const oneof of oneofs) {
            type.add(oneof)
        }

        this.overrideSetupMethod(type)

        return type
    }

    private resolveProtoShape(type: protobuf.Type, value: unknown): UnknownRecord {
        const source = isUnknownRecord(value) ? value : {}
        const result: UnknownRecord = {}

        for (const oneof of type.oneofsArray) {
            const branch = source[camelCase(oneof.name)]

            if (!isUnknownRecord(branch) || typeof branch['$case'] !== 'string') {
                continue
            }

            const memberName = snakeCase(branch['$case'])
            const member = oneof.fieldsArray.find((field) => field.name === memberName)

            if (member === undefined) {
                continue
            }

            result[member.name] = this.fieldResolver.resolveProtoField(
                member,
                branch['value']
            )
        }

        //// `partOf` is the one of a field belongs to, and the loop above already emitted
        //// every member through its `$case`, so re-reading them here would duplicate them
        for (const field of type.fieldsArray) {
            if (field.partOf !== null) {
                continue
            }

            const fieldValue = source[camelCase(field.name)]
            if (fieldValue === undefined) {
                continue
            }

            result[field.name] = this.fieldResolver.resolveProtoField(field, fieldValue)
        }

        return result
    }

    private resolveJsShape(type: protobuf.Type, message: unknown): UnknownRecord {
        const source = isUnknownRecord(message) ? message : {}
        const result: UnknownRecord = {}

        for (const oneof of type.oneofsArray) {
            const activeKey = source[oneof.name]

            if (typeof activeKey !== 'string') {
                continue
            }

            const member = oneof.fieldsArray.find((field) => field.name === activeKey)
            if (member === undefined) {
                continue
            }

            result[camelCase(oneof.name)] = {
                $case: camelCase(activeKey),
                value: this.fieldResolver.resolveJsField(member, source[activeKey]),
            }
        }

        //// same as `resolveProtoShape`, the one of members are already emitted by the loop above
        for (const field of type.fieldsArray) {
            if (field.partOf !== null) {
                continue
            }

            const isPresent = Object.prototype.hasOwnProperty.call(source, field.name)

            if (!isPresent) {
                const absentValue = this.fieldResolver.getAbsentValue(field)

                if (absentValue !== undefined) {
                    result[camelCase(field.name)] = absentValue
                }

                continue
            }

            result[camelCase(field.name)] = this.fieldResolver.resolveJsField(
                field,
                source[field.name]
            )
        }

        return result
    }

    private overrideSetupMethod(type: protobuf.Type): void {
        const setup = type.setup.bind(type)

        //// protobufjs generates the codecs lazily and drops them again whenever a field is
        //// added, so the overrides are reapplied from here rather than installed once
        type.setup = () => {
            setup()

            const encode = type.encode.bind(type)
            const decode = type.decode.bind(type)

            const encodeOverride: protobuf.Type['encode'] = (
                value: unknown,
                writer?: protobuf.Writer
            ) => {
                return encode(this.resolveProtoShape(type, value), writer)
            }
            type.encode = encodeOverride

            const decodeOverride = (
                reader: protobuf.Reader | Uint8Array,
                length?: number
            ) => {
                return this.resolveJsShape(type, decode(reader, length))
            }
            //// the override hands back the JS shape, not the `protobuf.Message` the signature promises
            type.decode = decodeOverride as unknown as protobuf.Type['decode']

            return type
        }
    }
}
