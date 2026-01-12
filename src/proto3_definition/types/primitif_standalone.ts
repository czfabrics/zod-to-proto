import { GetNewParams } from '#proto3_definition/types/get_new_params'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import {
    AnyProto3PrimitifType,
    Proto3ComplexPrimitifType,
    Proto3PrimitifType,
} from '#proto3_definition/types/primitifs'
import { Proto3ImportedType } from '#proto3_definition/types/types'
import { SomeType } from 'zod/v4/core'

export const Proto3StringType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'string',
            name: 'string',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3BoolType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'bool',
            name: 'bool',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3Int32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'int32',
            name: 'int32',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3Int64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'int64',
            name: 'int64',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3UInt32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'uint32',
            name: 'uint32',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3UInt64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'uint64',
            name: 'uint64',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3SInt32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sint32',
            name: 'sint32',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3SInt64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sint64',
            name: 'sint64',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3Fixed32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'fixed32',
            name: 'fixed32',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3Fixed64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'fixed64',
            name: 'fixed64',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3SFixed32Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sfixed32',
            name: 'sfixed32',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3SFixed64Type = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'sfixed64',
            name: 'sfixed64',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3DoubleType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'double',
            name: 'double',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3FloatType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'float',
            name: 'float',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
        }
    },
} as const

export const Proto3BytesType = {
    new: (schema: SomeType): Proto3PrimitifType => {
        return {
            internalName: 'bytes',
            name: 'bytes',
            schema,
            getDeepMessages() {
                return []
            },
            getDeepImportedTypes() {
                return []
            },
            getDeepOptionalMessageFields() {
                return []
            },
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
                return this.value.getDeepMessages()
            },
            getDeepImportedTypes() {
                return this.value.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                return this.value.getDeepOptionalMessageFields()
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
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | AnyProto3PrimitifType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepMessages()
            },
            getDeepImportedTypes() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | AnyProto3PrimitifType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | AnyProto3PrimitifType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepOptionalMessageFields()
            },
            ...params,
        }
    },
} as const
