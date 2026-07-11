import type { ReadOnly } from '#core/types/read_only'
import type { CheckZodSchemaCompatibility } from '#zod_converter/types/check'
import type { ZodPassthroughDirection } from '#zod_converter/types/passthroughs'
import type { SomeType } from 'zod/v4/core'

const UnscopedMessageId: unique symbol = Symbol.for('UnscopedMessage')
type UnscopedMessageId = typeof UnscopedMessageId
export interface UnscopedMessage extends ReadOnly<{
    [UnscopedMessageId]: UnscopedMessageId
    schema: SomeType
    direction: ZodPassthroughDirection
}> {}

export const UnscopedMessage = {
    new: function (
        direction: ZodPassthroughDirection,
        schema: SomeType
    ): UnscopedMessage {
        return {
            [UnscopedMessageId]: UnscopedMessageId,
            schema: schema,
            direction,
        }
    },
    safeNew: function <
        const TDirection extends ZodPassthroughDirection,
        const TSchema extends SomeType,
    >(
        direction: TDirection,
        schema: CheckZodSchemaCompatibility<TDirection, TSchema>
    ): UnscopedMessage {
        return {
            [UnscopedMessageId]: UnscopedMessageId,
            schema: schema as SomeType,
            direction,
        }
    },
}

const MessageInId: unique symbol = Symbol.for('MessageIn')
type MessageInId = typeof MessageInId
export interface MessageIn extends ReadOnly<{
    [MessageInId]: MessageInId
    schema: SomeType
}> {}

export const MessageIn = {
    new: function (schema: SomeType): MessageIn {
        return {
            [MessageInId]: MessageInId,
            schema: schema,
        }
    },
    safeNew: function <const TSchema extends SomeType>(
        schema: CheckZodSchemaCompatibility<'IN', TSchema>
    ): MessageIn {
        return {
            [MessageInId]: MessageInId,
            schema: schema as SomeType,
        }
    },
}

const MessageOutId: unique symbol = Symbol.for('MessageOut')
type MessageOutId = typeof MessageOutId
export interface MessageOut extends ReadOnly<{
    [MessageOutId]: MessageOutId
    schema: SomeType
}> {}

export const MessageOut = {
    new: function (schema: SomeType): MessageOut {
        return {
            [MessageOutId]: MessageOutId,
            schema: schema,
        }
    },
    safeNew: function <const TSchema extends SomeType>(
        schema: CheckZodSchemaCompatibility<'OUT', TSchema>
    ): MessageOut {
        return {
            [MessageOutId]: MessageOutId,
            schema: schema as SomeType,
        }
    },
}
