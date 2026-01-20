import {
    type AnyZodPassthroughInner,
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'

export const isZodSchemaDeprecated = function (
    schema: WithMaybeZodPassthrough<AnyZodPassthroughInner>
): boolean {
    const allMeta = ZodPassthroughType.getMetaAsDeepAsPossible(schema)

    const isDeprecated = allMeta.some((meta) => meta.deprecated)

    return isDeprecated
}
