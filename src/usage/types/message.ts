import type { CheckZodSchemaCompatibility } from '#zod_converter/types/check'
import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

export type Proto3RpcRawMessage = WithMaybeZodPassthrough<AnyZodMessage>

export const Proto3RpcRawMessage = {
    safe: function <const T extends SomeType>(
        schema: CheckZodSchemaCompatibility<T>
    ): CheckZodSchemaCompatibility<T> {
        return schema
    },
}
