import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { UsageSettings } from '#usage/types/settings'
import { ZodMessageConverter } from '#zod_converter/classes/zod_message_converter'
import { CheckZodSchemaCompatibility } from '#zod_converter/types/check'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SetOptional } from 'type-fest'
import type { SomeType } from 'zod/v4/core'

export type Proto3RpcRawFunction = SetOptional<
    Omit<GetNewParams<Proto3RpcFunction>, 'in' | 'out'> & {
        in: WithMaybeZodPassthrough<AnyZodMessage>
        out: WithMaybeZodPassthrough<AnyZodMessage>
    },
    'in' | 'inStream' | 'out' | 'outStream' | 'extensions' | 'comments'
>

export type Proto3RpcRawFunctionNewParams<
    TIn extends SomeType,
    TOut extends SomeType,
> = SetOptional<
    Omit<Proto3RpcRawFunction, 'in' | 'out'> & {
        in: CheckZodSchemaCompatibility<TIn>
        out: CheckZodSchemaCompatibility<TOut>
    },
    'in' | 'out'
>

export const Proto3RpcRawFunction = {
    safe: function <const TIn extends SomeType, const TOut extends SomeType>(
        params: Proto3RpcRawFunctionNewParams<TIn, TOut>
    ) {
        return {
            ...params,
        }
    },
    into: function (raw: Proto3RpcRawFunction, settings: UsageSettings) {
        const converter = new ZodMessageConverter(settings.transformers)

        const convertedIn = raw.in && converter.convert(`${raw.name}Input`, raw.in)
        const convertedOut = raw.out && converter.convert(`${raw.name}Output`, raw.out)

        return Proto3RpcFunction.new({
            ...raw,
            in: convertedIn ?? settings.protoVoidType,
            inStream: raw.inStream ?? false,
            out: convertedOut ?? settings.protoVoidType,
            outStream: raw.outStream ?? false,
            extensions: raw.extensions ?? [],
            comments: raw.comments ?? [],
        })
    },
}
