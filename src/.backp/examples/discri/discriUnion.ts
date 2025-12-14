import z from 'zod'

export const OfficeUserAuthScopeDefinitionSchema = z.object({
    name: z.literal('OFFICE_USER'),
    target: z.object({
        officeKey: z.string(),
        username: z.string().nonempty(),
    }),
})

export const PartnershipAuthScopeDefinitionSchema = z.object({
    name: z.literal('PARTNERSHIP'),
    target: z.object({
        officeKey: z.string(),
        companyKey: z.string(),
        partnershipKey: z.string(),
    }),
})

const MySchema = z.object({
    scope: z.discriminatedUnion('name', [
        OfficeUserAuthScopeDefinitionSchema,
        PartnershipAuthScopeDefinitionSchema,
    ]),
})

MySchema['shape'].scope._zod.def.discriminator

type test = z.output<typeof MySchema>
