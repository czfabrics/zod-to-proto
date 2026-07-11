import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import type { ReadOnlyProto3ImportedType } from '#proto3_definition/types/types'
import type { MessageIn, MessageOut } from '#usage/types/messages'
import type { UsageSettings } from '#usage/types/settings'
import { assertsAnyZodMessage } from '#zod_converter/asserts/any_zod_message'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import type { SetOptional } from 'type-fest'

export type Proto3RpcRawFunction = SetOptional<
    Omit<GetNewParams<Proto3RpcFunction>, 'in' | 'out'> & {
        in: MessageIn
        out: MessageOut
    },
    'typePrefix' | 'in' | 'inStream' | 'out' | 'outStream' | 'extensions' | 'comments'
>

export const Proto3RpcRawFunction = {
    into: function (raw: Proto3RpcRawFunction, settings: UsageSettings) {
        const inMessageName = raw.typePrefix ? `Input` : `${raw.name}Input`
        const outMessageName = raw.typePrefix ? `Output` : `${raw.name}Output`

        const functionInOut: {
            in: ReadOnlyAnyProto3Message | ReadOnlyProto3ImportedType
            out: ReadOnlyAnyProto3Message | ReadOnlyProto3ImportedType
        } = {
            in: settings.protoVoidType,
            out: settings.protoVoidType,
        }

        if (raw.in !== undefined) {
            const converter = new ZodMessageConverter(
                { direction: 'IN' },
                settings.conversionReuseStrategies,
                settings.transformers,
                settings.transformationReuseStrategies
            )

            assertsAnyZodMessage({ direction: 'IN' }, raw.in.schema)
            functionInOut.in = converter.convert(inMessageName, raw.in.schema)
        }

        if (raw.out !== undefined) {
            const converter = new ZodMessageConverter(
                { direction: 'OUT' },
                settings.conversionReuseStrategies,
                settings.transformers,
                settings.transformationReuseStrategies
            )

            assertsAnyZodMessage({ direction: 'OUT' }, raw.out.schema)
            functionInOut.out = converter.convert(outMessageName, raw.out.schema)
        }

        return Proto3RpcFunction.new({
            ...raw,
            ...functionInOut,
            typePrefix: raw.typePrefix ?? null,
            inStream: raw.inStream ?? false,
            outStream: raw.outStream ?? false,
            extensions: raw.extensions ?? [],
            comments: raw.comments ?? [],
        })
    },
}
