import {
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ZodObject, ZodType } from 'zod'

export const isZodSchemaDeprecated = function (
    schema: WithMaybeZodPassthrough<ZodType | ZodObject>
) {
    const allMeta = ZodPassthroughType.getMetaAsDeepAsPossible(schema)

    const isDeprecated = allMeta.some((meta) => meta.deprecated)

    return isDeprecated
}
