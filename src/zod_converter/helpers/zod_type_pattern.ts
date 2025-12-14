export const zodTypePattern = function <TZodTypeValue>(zodTypeValue: TZodTypeValue): {
    _zod: {
        def: {
            type: TZodTypeValue
        }
    }
} {
    return {
        _zod: {
            def: {
                type: zodTypeValue,
            },
        },
    }
}
