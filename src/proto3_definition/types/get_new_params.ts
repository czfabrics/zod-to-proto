import { ReadOnly } from '#core/types/read_only'

export type GetNewParams<T> =
    | Omit<
          T,
          | 'id'
          | 'internalName'
          | 'clone'
          | 'updateDeepInnerType'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getDeepInnerType'
          | 'getNextIndex'
      >
    | ReadOnly<
          Omit<
              T,
              | 'id'
              | 'internalName'
              | 'clone'
              | 'updateDeepInnerType'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getDeepInnerType'
              | 'getNextIndex'
          >
      >

export type GetOverrideParams<T> =
    | Omit<
          T,
          | 'internalName'
          | 'clone'
          | 'updateDeepInnerType'
          | 'addPrefix'
          | 'propagateTypePrefix'
          | 'computeNewIndexForFields'
          | 'getDeepMessages'
          | 'getDeepImportedTypes'
          | 'getDeepInnerType'
          | 'getNextIndex'
      >
    | ReadOnly<
          Omit<
              T,
              | 'internalName'
              | 'clone'
              | 'updateDeepInnerType'
              | 'addPrefix'
              | 'propagateTypePrefix'
              | 'computeNewIndexForFields'
              | 'getDeepMessages'
              | 'getDeepImportedTypes'
              | 'getDeepInnerType'
              | 'getNextIndex'
          >
      >

export type GetAnyNewParams<T> = Omit<
    T,
    | 'id'
    | 'clone'
    | 'updateDeepInnerType'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'computeNewIndexForFields'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getDeepInnerType'
    | 'getNextIndex'
>
