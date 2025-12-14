import type { ZodChildArray } from '#zod_converter/types/check'
import type { ZodDiscriminatedUnion, ZodUnion } from 'zod'

export const isZodDiscriminatedUnion = function (
    schema: ZodUnion<ZodChildArray> | ZodDiscriminatedUnion<ZodChildArray>
): schema is ZodDiscriminatedUnion<ZodChildArray> {
    return !!(
        schema as {
            _zod: {
                def: {
                    discriminator?: string
                }
            }
        }
    )._zod.def.discriminator
}
