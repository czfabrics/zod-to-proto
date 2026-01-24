import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import { Proto3RpcService } from '#proto3_definition/types/service'
import { Proto3RpcRawFunction } from '#usage/types/functions'
import type { UsageSettings } from '#usage/types/settings'
import type { SetOptional } from 'type-fest'

export type Proto3RpcRawService = SetOptional<
    Omit<GetNewParams<Proto3RpcService>, 'functions'> & {
        functions: Proto3RpcRawFunction[]
    },
    'extensions' | 'comments'
>

export const Proto3RpcRawService = {
    into: function (raw: Proto3RpcRawService, settings: UsageSettings) {
        const convertedFunctions = raw.functions.map((rawFunction) => {
            return Proto3RpcRawFunction.into(rawFunction, settings)
        })

        return Proto3RpcService.new({
            ...raw,
            functions: convertedFunctions,
            extensions: raw.extensions ?? [],
            comments: raw.comments ?? [],
        })
    },
}
