import type * as protobuf from 'protobufjs'

//// protobufjs only defaults an object to proto3 through `fromJSON`, so a directly built one
//// would otherwise resolve its features as proto2, down to an expanded repeated encoding
export const pinProto3Edition = function <TObject extends protobuf.ReflectionObject>(
    object: TObject
): TObject {
    const editable = object as unknown as { _edition: string }

    editable._edition = 'proto3'

    return object
}
