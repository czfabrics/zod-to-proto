import type { ZodConversionContext } from '#zod_converter/types/conversion'
import {
    type AnyZodPassthroughInner,
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'

export const isZodSchemaDeprecated = function (
    context: ZodConversionContext,
    schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
): boolean {
    const allMeta = ZodPassthroughType.getMetaAsDeepAsPossible(context.direction, schema)

    const isDeprecated = allMeta.some((meta) => meta.deprecated)

    return isDeprecated
}
