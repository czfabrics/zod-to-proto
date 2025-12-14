export const isFormatCompatible = <
    const TFormatValues extends string[],
    TObject extends { format: string | null },
>(
    formatValues: TFormatValues,
    object: TObject
): object is TObject & {
    format: TFormatValues[number]
} => {
    if (object.format === null) {
        return false
    }

    return formatValues.includes(object.format)
}
