export type GetNewParams<T> = Omit<T, 'internalName' | 'getDeepMessages' | 'getNextIndex'>
