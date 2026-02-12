import type { ReadOnly } from '#core/types/read_only'
import type { GetOverrideParams } from '#proto3_definition/types/get_new_params'

export type CloneParams<T> =
    | Partial<GetOverrideParams<T>>
    | Partial<GetOverrideParams<ReadOnly<T>>>
    | undefined
