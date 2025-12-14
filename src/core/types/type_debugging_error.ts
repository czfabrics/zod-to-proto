export type TypeDebuggingError<TMessage extends string> = {
    message: TMessage & void
} & void
