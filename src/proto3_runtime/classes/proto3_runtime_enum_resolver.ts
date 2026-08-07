import type { ReadOnlyProto3Enum } from '#proto3_definition/types/messages'
import { pinProto3Edition } from '#proto3_runtime/helpers/pin_proto3_edition'
import * as protobuf from 'protobufjs'

export class Proto3RuntimeEnumResolver {
    public resolveType(messageEnum: ReadOnlyProto3Enum): protobuf.Enum {
        const values: Record<string, number> = {}

        for (const field of messageEnum.fields) {
            values[field.key] = field.index
        }

        return pinProto3Edition(new protobuf.Enum(messageEnum.name, values))
    }
}
