import { ReadOnly } from '#core/types/read_only'

export type GetNewParams<T> =
    | Omit<
          T,
          | 'id'
          | 'internalName'
          | 'clone'
          | 'duplicate'
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
              | 'duplicate'
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
          | 'duplicate'
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
              | 'duplicate'
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
    | 'duplicate'
    | 'updateDeepInnerType'
    | 'addPrefix'
    | 'propagateTypePrefix'
    | 'computeNewIndexForFields'
    | 'getDeepMessages'
    | 'getDeepImportedTypes'
    | 'getDeepInnerType'
    | 'getNextIndex'
>
