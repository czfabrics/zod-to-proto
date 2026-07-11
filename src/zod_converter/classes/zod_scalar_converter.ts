import {
    Proto3BoolType,
    Proto3DoubleType,
    Proto3FloatType,
    Proto3Int32Type,
    Proto3Int64Type,
    Proto3StringType,
    Proto3UInt32Type,
    Proto3UInt64Type,
} from '#proto3_definition/types/scalar_standalones'
import type { ReadOnlyProto3ScalarType } from '#proto3_definition/types/scalars'
import { assertsZodFormat } from '#zod_converter/asserts/zod_format'
import type { ZodConversionContext } from '#zod_converter/types/conversion'
import {
    WithMaybeZodPassthrough,
    ZodPassthroughType,
} from '#zod_converter/types/passthroughs'
import type { ZodScalarType } from '#zod_converter/types/scalars'
import { match } from 'ts-pattern'

export class ZodScalarConverter {
    public constructor(private readonly context: ZodConversionContext) {}

    public convert(
        rootSchema: WithMaybeZodPassthrough<ZodScalarType>
    ): ReadOnlyProto3ScalarType {
        const deepSchema = ZodPassthroughType.pass(this.context.direction, rootSchema)

        return match(deepSchema)
            .returnType<ReadOnlyProto3ScalarType>()
            .with(
                {
                    _zod: {
                        def: {
                            type: 'string',
                        },
                    },
                },
                () => Proto3StringType.new()
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'number',
                        },
                    },
                },
                (schema) => {
                    if (schema.format === null) {
                        //// Handles `z.number()`
                        return Proto3DoubleType.new()
                    }

                    assertsZodFormat(
                        ['safeint', 'float32', 'float64', 'int32', 'uint32'],
                        schema
                    )

                    return match(schema)
                        .with({ format: 'safeint' }, () => {
                            //// int64 because int can be int32 or int64
                            return Proto3Int64Type.new()
                        })
                        .with({ format: 'int32' }, () => Proto3Int32Type.new())
                        .with({ format: 'float32' }, () => Proto3FloatType.new())
                        .with({ format: 'float64' }, () => Proto3DoubleType.new())
                        .with({ format: 'uint32' }, () => Proto3UInt32Type.new())
                        .exhaustive()
                }
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'bigint',
                        },
                    },
                },
                (schema) => {
                    assertsZodFormat(['int64', 'uint64'], schema)

                    return match(schema)
                        .with({ format: 'int64' }, () => Proto3Int64Type.new())
                        .with({ format: 'uint64' }, () => Proto3UInt64Type.new())
                        .exhaustive()
                }
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'boolean',
                        },
                    },
                },
                () => Proto3BoolType.new()
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'literal',
                        },
                    },
                },
                () => Proto3StringType.new()
            )
            .with(
                {
                    _zod: {
                        def: {
                            type: 'template_literal',
                        },
                    },
                },
                () => Proto3StringType.new()
            )
            .exhaustive()
    }
}
