import type { Prettify } from '#core/types/prettify'
import type { Add, Subtract } from 'ts-arithmetic'

export type DynamicSettings = {
    lineTabLevel: number
    blockLevel: number
}

export type SettingsCounters = 'lineTabLevel' | 'blockLevel'

export type IncreaseCounter<
    TSettings extends DynamicSettings,
    TCounterKeys extends SettingsCounters[],
> = Prettify<{
    [TKey in keyof TSettings]: TKey extends TCounterKeys[number]
        ? Add<TSettings[TKey], 1>
        : TSettings[TKey]
}>

export type DecreaseCounter<
    TSettings extends DynamicSettings,
    TCounterKeys extends SettingsCounters[],
> = Prettify<{
    [TKey in keyof TSettings]: TKey extends TCounterKeys[number]
        ? Subtract<TSettings[TKey], 1>
        : TSettings[TKey]
}>
