export type Proto3ExtensionScalarValue = string | number | boolean
export type Proto3ExtensionRepeatedValue = Proto3ExtensionScalarValue[]
export type Proto3ExtensionMessageValue = {
    [key: string]:
        | Proto3ExtensionScalarValue
        | Proto3ExtensionMessageValue
        | Proto3ExtensionRepeatedValue
}

export type AnyProto3ExtensionValue =
    | Proto3ExtensionScalarValue
    | Proto3ExtensionMessageValue
    | Proto3ExtensionRepeatedValue
