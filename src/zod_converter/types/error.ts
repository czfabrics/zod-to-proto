import { SomeType } from 'zod/v4/core'

export interface SchemaError extends Error {
    schema: SomeType
}

export const SchemaError = {
    new: (message: string, schema: SomeType, name?: string): SchemaError => {
        const error = new Error(message)

        if (name) {
            error.name = name
        }

        Object.assign(error, {
            schema,
        })

        return error as SchemaError
    },
} as const
