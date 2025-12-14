import { isFormatCompatible } from '#zod_converter/helpers/is_format_compatible'
import { SchemaError } from '#zod_converter/types/error'
import { SomeType } from 'zod/v4/core'

type AssertsZodFormatFn = <
    const TFormatValues extends string[],
    TObject extends SomeType & { format: string | null },
>(
    formatValues: TFormatValues,
    object: TObject
) => asserts object is TObject & {
    format: TFormatValues[number]
}

export const assertsZodFormat: AssertsZodFormatFn = function <
    const TFormatValues extends string[],
    TObject extends SomeType & { format: string | null },
>(
    formatValues: TFormatValues,
    object: TObject
): asserts object is TObject & {
    format: TFormatValues[number]
} {
    if (!isFormatCompatible(formatValues, object)) {
        throw SchemaError.new(
            `The schema should be uses these formats: [${formatValues.join(', ')}]`,
            object
        )
    }
}
