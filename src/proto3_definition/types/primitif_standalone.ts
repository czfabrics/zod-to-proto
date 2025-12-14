import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import type {
    AnyProto3PrimitifType,
    Proto3ComplexPrimitifType,
    Proto3PrimitifType,
} from '#proto3_definition/types/primitifs'
import { match } from 'ts-pattern'
import { SomeType } from 'zod/v4/core'

export const Proto3StringType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'string',
            name: 'string',
            schema,
        }
    },
} as const

export const Proto3BoolType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'bool',
            name: 'bool',
            schema,
        }
    },
} as const

export const Proto3Int32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'int32',
            name: 'int32',
            schema,
        }
    },
} as const

export const Proto3Int64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'int64',
            name: 'int64',
            schema,
        }
    },
} as const

export const Proto3UInt32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'uint32',
            name: 'uint32',
            schema,
        }
    },
} as const

export const Proto3UInt64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'uint64',
            name: 'uint64',
            schema,
        }
    },
} as const

export const Proto3SInt32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sint32',
            name: 'sint32',
            schema,
        }
    },
} as const

export const Proto3SInt64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sint64',
            name: 'sint64',
            schema,
        }
    },
} as const

export const Proto3Fixed32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'fixed32',
            name: 'fixed32',
            schema,
        }
    },
} as const

export const Proto3Fixed64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'fixed64',
            name: 'fixed64',
            schema,
        }
    },
} as const

export const Proto3SFixed32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sfixed32',
            name: 'sfixed32',
            schema,
        }
    },
} as const

export const Proto3SFixed64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sfixed64',
            name: 'sfixed64',
            schema,
        }
    },
} as const

export const Proto3DoubleType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'double',
            name: 'double',
            schema,
        }
    },
} as const

export const Proto3FloatType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'float',
            name: 'float',
            schema,
        }
    },
} as const

export const Proto3BytesType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'bytes',
            name: 'bytes',
            schema,
        }
    },
} as const

export const Proto3MapType = {
    new: (
        params: GetNewParams<Extract<Proto3ComplexPrimitifType, { internalName: 'map' }>>
    ): Proto3ComplexPrimitifType => {
        return {
            internalName: 'map',
            getDeepMessages() {
                if (AnyProto3Message.is(this.value)) {
                    return this.value.getDeepMessages()
                }

                return []
            },
            ...params,
        }
    },
} as const

export const Proto3RepeatedType = {
    new: (
        params: GetNewParams<
            Extract<Proto3ComplexPrimitifType, { internalName: 'repeated' }>
        >
    ): Proto3ComplexPrimitifType => {
        return {
            internalName: 'repeated',
            getDeepMessages() {
                let currentItem: AnyProto3Message | AnyProto3PrimitifType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = match(currentItem)
                        .with({ internalName: 'repeated' }, (repeated) => repeated.inner)
                        .otherwise((other) => other)
                }

                if (AnyProto3Message.is(currentItem)) {
                    return currentItem.getDeepMessages()
                }

                return []
            },
            ...params,
        }
    },
} as const
