import cryptoRandomString from 'crypto-random-string'

export const getRandomId = function (): string {
    return cryptoRandomString({ length: 5 })
}
