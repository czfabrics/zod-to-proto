## Plugin

### Custom Type

```ts
import { Proto3ImportedType } from '{{ pkg.name }}'

export const Proto3Empty = {
    useType: () => {
        return Proto3ImportedType.new({
            importPath: 'google/protobuf/empty.proto',
            typeReference: 'google.protobuf.Empty',
        })
    },
} as const
```

### Custom Extension

```ts
import { Proto3Extension, Proto3ImportedType } from '{{ pkg.name }}'

export const Proto3ValidateFieldAnnotation = {
    useType: function () {
        return Proto3ImportedType.new({
            importPath: 'buf/validate/validate.proto',
            typeReference: 'buf.validate.field',
        })
    },
    useExtension: function (value: { required?: boolean }) {
        return Proto3Extension.new({
            key: this.useType(),
            value,
        })
    },
} as const
```

### Zod Conversion Transformer

This package allows you to write custom transformers to modify Protobuf definitions after converting from Zod schemas.

**Available transformers:**

- `ZodDeprecatedMessageConversionTransformer`
- `ZodMessageNameIncludedInFieldConversionTransformer`
- `ZodEnumNameIncludedInFieldConversionTransformer`
- `ZodMessageNameConversionTransformer`
- `ZodDeprecatedFieldConversionTransformer`
- `ZodRequiredFieldConversionTransformer`
- `ZodDeprecatedOneOfFieldConversionTransformer`
- `ZodRequiredOneOfFieldConversionTransformer`
- `ZodDeprecatedEnumConversionTransformer`
- `ZodEnumNameConversionTransformer`

#### Writing a transformer

```ts
import {
    Proto3Deprecated,
    type ReadOnlyProto3MessageField,
    isZodSchemaDeprecated,
    ZodMessageFieldType,
    WithMaybeZodPassthrough,
    ZodMessageFieldConversionTransformer,
} from '{{ pkg.name }}'

export class ZodDeprecatedFieldConversionTransformer implements ZodMessageFieldConversionTransformer {
    transform(
        schema: WithMaybeZodPassthrough<ZodMessageFieldType>,
        protoDefinition: ReadOnlyProto3MessageField
    ): ReadOnlyProto3MessageField {
        const isDeprecated = isZodSchemaDeprecated(schema)

        if (!isDeprecated) {
            return protoDefinition
        }

        return protoDefinition.clone({
            extensions: [
                ...protoDefinition.extensions,
                Proto3Deprecated.useExtension(true),
            ],
        })
    }
}
```

#### Using a Transformer

```ts
zodToProto(
    <...>,
    {
        transformers: {
            message: [],
            messageField: [new ZodDeprecatedFieldConversionTransformer()],
            messageOneOfField: [],
            enum: [],
        },
    }
)
```
