import type { UnknownRecord } from '#core/types/unknown_record'

export const isUnknownRecord = function (value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
