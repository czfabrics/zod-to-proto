import { Proto3File } from '#proto3_definition/types/file'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3RpcRawService } from '#usage/types/services'
import type { UsageSettings } from '#usage/types/settings'
import type { SetOptional } from 'type-fest'

export type Proto3RawFile = SetOptional<
    Omit<GetNewParams<Proto3File>, 'service'> & {
        service?: Proto3RpcRawService
    },
    'syntax' | 'extensions'
>

export const Proto3RawFile = {
    into: function (raw: Proto3RawFile, settings: UsageSettings) {
        const convertedService =
            raw.service && Proto3RpcRawService.into(raw.service, settings)

        return Proto3File.new({
            ...raw,
            syntax: raw.syntax ?? 'proto3',
            service: convertedService,
            extensions: raw.extensions ?? [],
        })
    },
}
