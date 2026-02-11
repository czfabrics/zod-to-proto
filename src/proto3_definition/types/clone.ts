import type { DeepReadOnly } from '#proto3_definition/types/deep_read_only'
import type { GetOverrideParams } from '#proto3_definition/types/get_new_params'

export type CloneParams<T> =
    | Partial<GetOverrideParams<T>>
    | Partial<GetOverrideParams<DeepReadOnly<T>>>
    | undefined
