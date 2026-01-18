import type { Proto3DynamicSizeType } from '#proto3_definition/types/dynamic_size'
import type { GetNewParams } from '#proto3_definition/types/get_new_params'
import type { AnyProto3Message } from '#proto3_definition/types/messages'
import type { Proto3ScalarType } from '#proto3_definition/types/scalars'
import type { Proto3ImportedType } from '#proto3_definition/types/types'

export const Proto3StringType = {
    new: (): Proto3ScalarType => {
        return {
            internalName: 'string',
            name: 'string',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'bool',
            name: 'bool',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'int32',
            name: 'int32',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'int64',
            name: 'int64',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'uint32',
            name: 'uint32',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'uint64',
            name: 'uint64',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'sint32',
            name: 'sint32',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'sint64',
            name: 'sint64',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'fixed32',
            name: 'fixed32',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'fixed64',
            name: 'fixed64',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'sfixed32',
            name: 'sfixed32',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'sfixed64',
            name: 'sfixed64',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'double',
            name: 'double',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'float',
            name: 'float',
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
    new: (): Proto3ScalarType => {
        return {
            internalName: 'bytes',
            name: 'bytes',
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
        params: GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'map' }>>
    ): Proto3DynamicSizeType => {
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
        params: GetNewParams<Extract<Proto3DynamicSizeType, { internalName: 'repeated' }>>
    ): Proto3DynamicSizeType => {
        return {
            internalName: 'repeated',
            getDeepMessages() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepMessages()
            },
            getDeepImportedTypes() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepImportedTypes()
            },
            getDeepOptionalMessageFields() {
                let currentItem:
                    | AnyProto3Message
                    | Proto3ImportedType
                    | Proto3DynamicSizeType
                    | Proto3ScalarType = this

                while (currentItem.internalName === 'repeated') {
                    currentItem = currentItem.inner
                }

                return currentItem.getDeepOptionalMessageFields()
            },
            ...params,
        }
    },
} as const
