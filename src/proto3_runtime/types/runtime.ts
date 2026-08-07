import type { ServiceDefinition } from '@grpc/grpc-js'
import type * as protobuf from 'protobufjs'

export type Proto3RuntimeDefinition = {
    root: protobuf.Root
    services: Readonly<Record<string, ServiceDefinition>>
}
