import { Proto3File } from '#proto3_definition/types/file'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { ReadOnlyAnyProto3Message } from '#proto3_definition/types/messages'
import { Proto3RpcRawService } from '#usage/types/services'
import type { UsageSettings } from '#usage/types/settings'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import { AnyZodMessage } from '#zod_converter/types/messages'
import { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import { pascalCase } from 'change-case'
import type { SetOptional } from 'type-fest'

export type Proto3RawFile = SetOptional<
    Omit<GetNewParams<Proto3File>, 'services' | 'unscopedMessages'> & {
        services: Proto3RpcRawService[]
        unscopedMessages: Record<string, WithMaybeZodPassthrough<AnyZodMessage>>
    },
    'syntax' | 'typePrefix' | 'unscopedMessages' | 'extensions'
>

export const Proto3RawFile = {
    into: function (raw: Proto3RawFile, settings: UsageSettings) {
        const convertedServices = raw.services.map((rawService) => {
            return Proto3RpcRawService.into(rawService, settings)
        })

        raw.unscopedMessages ??= {}

        const converter = new ZodMessageConverter(
            settings.reuseStrategies,
            settings.transformers
        )
        const convertedMessages: ReadOnlyAnyProto3Message[] = []

        for (const [name, schema] of Object.entries(raw.unscopedMessages)) {
            const message = converter.convert(pascalCase(name), schema)

            convertedMessages.push(message)
        }

        return Proto3File.new({
            ...raw,
            syntax: raw.syntax ?? 'proto3',
            typePrefix: raw.typePrefix ?? null,
            services: convertedServices,
            unscopedMessages: convertedMessages,
            extensions: raw.extensions ?? [],
        })
    },
}
