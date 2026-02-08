import { AnyZodMessage } from '#zod_converter/types/messages'
import z from 'zod'

type ProtoMessageMeta = Partial<{
    protoConversionId: string
    protoDefinitionName: string
}>

const protoSchemaRegistry = z.registry<ProtoMessageMeta, AnyZodMessage>()

export const setProtoMeta = function <TMessage extends AnyZodMessage>(
    schema: TMessage,
    meta: ProtoMessageMeta
): TMessage {
    protoSchemaRegistry.add(schema, meta)

    return schema
}

export const setProtoConversionId = function <TMessage extends AnyZodMessage>(
    schema: TMessage,
    conversionId: string
): TMessage {
    protoSchemaRegistry.add(schema, {
        protoConversionId: conversionId,
    })

    return schema
}

export const getProtoConversionId = function (schema: AnyZodMessage): string | undefined {
    return protoSchemaRegistry.get(schema)?.protoConversionId
}

export const getProtoMeta = function (schema: AnyZodMessage): ProtoMessageMeta {
    return protoSchemaRegistry.get(schema) ?? {}
}
