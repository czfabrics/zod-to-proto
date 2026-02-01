import { Proto3ScalarType } from '#proto3_definition/types/scalars'

export const Proto3StringType = {
    new: function () {
        return Proto3ScalarType.new('string')
    },
} as const

export const Proto3BoolType = {
    new: function () {
        return Proto3ScalarType.new('bool')
    },
} as const

export const Proto3Int32Type = {
    new: function () {
        return Proto3ScalarType.new('int32')
    },
} as const

export const Proto3Int64Type = {
    new: function () {
        return Proto3ScalarType.new('int64')
    },
} as const

export const Proto3UInt32Type = {
    new: function () {
        return Proto3ScalarType.new('uint32')
    },
} as const

export const Proto3UInt64Type = {
    new: function () {
        return Proto3ScalarType.new('uint64')
    },
} as const

export const Proto3SInt32Type = {
    new: function () {
        return Proto3ScalarType.new('sint32')
    },
} as const

export const Proto3SInt64Type = {
    new: function () {
        return Proto3ScalarType.new('sint64')
    },
} as const

export const Proto3Fixed32Type = {
    new: function () {
        return Proto3ScalarType.new('fixed32')
    },
} as const

export const Proto3Fixed64Type = {
    new: function () {
        return Proto3ScalarType.new('fixed64')
    },
} as const

export const Proto3SFixed32Type = {
    new: function () {
        return Proto3ScalarType.new('sfixed32')
    },
} as const

export const Proto3SFixed64Type = {
    new: function () {
        return Proto3ScalarType.new('sfixed64')
    },
} as const

export const Proto3DoubleType = {
    new: function () {
        return Proto3ScalarType.new('double')
    },
} as const

export const Proto3FloatType = {
    new: function () {
        return Proto3ScalarType.new('float')
    },
} as const

export const Proto3BytesType = {
    new: function () {
        return Proto3ScalarType.new('bytes')
    },
} as const
