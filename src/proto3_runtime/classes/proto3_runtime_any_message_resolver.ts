import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RuntimeEnumResolver } from '#proto3_runtime/classes/proto3_runtime_enum_resolver'
import { Proto3RuntimeMessageResolver } from '#proto3_runtime/classes/proto3_runtime_message_resolver'
import type * as protobuf from 'protobufjs'
import { match } from 'ts-pattern'

export class Proto3RuntimeAnyMessageResolver {
    private readonly enumResolver = new Proto3RuntimeEnumResolver()
    private readonly messageResolver = new Proto3RuntimeMessageResolver()

    public resolveType(
        anyMessage: ReadOnlyAnyProto3Message
    ): protobuf.Type | protobuf.Enum {
        return match(anyMessage)
            .returnType<protobuf.Type | protobuf.Enum>()
            .with({ internalName: 'enum' }, (messageEnum) => {
                return this.enumResolver.resolveType(messageEnum)
            })
            .with({ internalName: 'message' }, (message) => {
                return this.messageResolver.resolveType(message)
            })
            .exhaustive()
    }
}
