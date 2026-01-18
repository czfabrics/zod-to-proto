import {
    type WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ZodObject, ZodType } from 'zod'

export const getZodSchemaComments = function (
    schema: WithMaybeZodPassthrough<ZodType | ZodObject>
): string[] {
    const allMeta = ZodPassthroughType.getMetaAsDeepAsPossible(schema)

    const descriptions = allMeta
        .map((meta) => meta.description)
        .filter(Boolean) as string[]

    const comments = descriptions.map((description) => description.split('\n')).flat()

    let startIndex: number = -1
    let endIndex: number = -1

    for (let index = 0; index < comments.length; index++) {
        const comment = comments[index]!

        if (comment === '') {
            continue
        } else {
            startIndex = index
            break
        }
    }

    for (let index = comments.length - 1; index >= 0; index--) {
        const comment = comments[index]!

        if (comment === '') {
            continue
        } else {
            endIndex = index
            break
        }
    }

    if (startIndex === -1 || endIndex === -1) {
        return []
    }

    return comments.slice(startIndex, endIndex + 1)
}
