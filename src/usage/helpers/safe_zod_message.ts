import { CheckZodSchemaCompatibility } from '#zod_converter/types/check'
import { SomeType } from 'zod/v4/core'

export const safeZodMessage = function <const T extends SomeType>(
    schema: CheckZodSchemaCompatibility<T>
) {
    return schema
}
