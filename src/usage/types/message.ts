import type { AnyZodMessage } from '#zod_converter/types/messages'
import type { WithMaybeZodPassthrough } from '#zod_converter/types/passthroughs'

export type Proto3RpcRawMessage = WithMaybeZodPassthrough<AnyZodMessage>
