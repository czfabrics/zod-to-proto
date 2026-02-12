import { setProtoMeta } from '#zod_converter/helpers/registry'
import { pz } from '@czlab/zod-to-proto'
import z, { type ZodLiteral, type ZodObject, type ZodString } from 'zod'
import type { $ZodShape } from 'zod/v4/core'

type TaskSchemaParams = {
    name: string
    externalTarget: readonly EntityName[]
    internalTarget: readonly EntityName[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never

type EntityName = string

type EntityRawTarget<TEntities extends readonly EntityName[]> = {
    [TKey in number]: {
        [TKey2 in TEntities[TKey]]: ZodObject<{
            externalId: ZodString
        }>
    }
}[number]
type EntityTargetShape<TEntities extends readonly EntityName[]> = UnionToIntersection<
    EntityRawTarget<TEntities>
>
type SafeEntityShape<TEntities extends readonly EntityName[]> =
    EntityTargetShape<TEntities> extends $ZodShape ? EntityTargetShape<TEntities> : never

type ExternalTaskSchema<TParams extends TaskSchemaParams> = ZodObject<{
    name: ZodLiteral<TParams['name']>
    target: ZodObject<SafeEntityShape<TParams['externalTarget']>>
}>

type InternalTaskSchema<TParams extends TaskSchemaParams> = ZodObject<{
    name: ZodLiteral<TParams['name']>
    target: ZodObject<SafeEntityShape<TParams['internalTarget']>>
}>

type TaskSchema<TParams extends TaskSchemaParams> = {
    external: ExternalTaskSchema<TParams>
    internal: InternalTaskSchema<TParams>
}

const getExternalTaskSchema = function <const TParams extends TaskSchemaParams>(
    params: TParams
): ExternalTaskSchema<TParams> {
    const entries = params.externalTarget.map((entityName) => {
        return [
            entityName,
            setProtoMeta(
                z.object({
                    externalId: z.string().nonempty(),
                }),
                {
                    protoConversionId: `task_external_entity_${entityName}_schema`,
                }
            ),
        ]
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const shape: SafeEntityShape<TParams['externalTarget']> = Object.fromEntries(entries)
    const target = z.object(shape) as ZodObject<
        SafeEntityShape<TParams['externalTarget']>
    >

    return z.object({
        name: z.literal(params.name),
        target,
    })
}

const getInternalTaskSchema = function <const TParams extends TaskSchemaParams>(
    params: TParams
): InternalTaskSchema<TParams> {
    const entries = params.internalTarget.map((entityName) => {
        return [
            entityName,
            z.object({
                externalId: z.string().nonempty(),
            }),
        ]
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const shape: SafeEntityShape<TParams['internalTarget']> = Object.fromEntries(entries)
    const target = z.object(shape) as ZodObject<
        SafeEntityShape<TParams['internalTarget']>
    >

    return z.object({
        name: z.literal(params.name),
        target,
    })
}

export const getTaskSchema = function <const TParams extends TaskSchemaParams>(
    params: TParams
): TaskSchema<TParams> {
    return {
        external: getExternalTaskSchema(params),
        internal: getInternalTaskSchema(params),
    }
}

export const SynchronizationTaskEnum = {
    SYNCHRONIZE_OFFICE_USERS: 'synchronizeOfficeUsers',
    CREATE_OFFICE_USER: 'createOfficeUser',
    UPDATE_OFFICE_USER: 'updateOfficeUser',
    CREATE_WORKSPACE: 'createWorkspace',
    UPDATE_WORKSPACE: 'updateWorkspace',
    CREATE_MEETING: 'createMeeting',
    UPDATE_MEETING: 'updateMeeting',
    UPDATE_STOCKHOLDERS: 'updateStockholders',
    UPDATE_GOVERNANCE: 'updateGovernance',
    CREATE_OTHER_PERSON: 'createOtherPerson',
    UPDATE_OTHER_PERSON: 'updateOtherPerson',
    CREATE_OTHER_COMPANY: 'createOtherCompany',
    UPDATE_OTHER_COMPANY: 'updateOtherCompany',
    CREATE_DOCUMENT: 'createDocument',
    UPDATE_DOCUMENT: 'updateDocument',
} as const

export const SynchronizationTaskGroupEnum = {
    SYNCHRONIZE_FULL_WORKSPACE: 'synchronizeFullWorkspace',
} as const

export const SynchronizeFullWorkspaceTaskSchema = getTaskSchema({
    name: SynchronizationTaskGroupEnum.SYNCHRONIZE_FULL_WORKSPACE,
    externalTarget: ['credential', 'workspace'],
    internalTarget: ['office', 'credential', 'workspace'],
})

export const SynchronizeOfficeUsersTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.SYNCHRONIZE_OFFICE_USERS,
    externalTarget: ['workspace'],
    internalTarget: ['office', 'workspace'],
})
export type SynchronizeOfficeUsersTask = z.infer<
    (typeof SynchronizeOfficeUsersTaskSchema)['internal']
>
export type SynchronizeOfficeUsersTaskTarget = SynchronizeOfficeUsersTask['target']

export const CreateOfficeUserTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_OFFICE_USER,
    externalTarget: ['workspace', 'credential'],
    internalTarget: ['office', 'workspace', 'credential'],
})
export type CreateOfficeUserTask = z.infer<
    (typeof CreateOfficeUserTaskSchema)['internal']
>
export type CreateOfficeUserTaskTarget = CreateOfficeUserTask['target']

export const UpdateOfficeUserTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_OFFICE_USER,
    externalTarget: ['workspace', 'credential'],
    internalTarget: ['office', 'workspace', 'credential'],
})
export type UpdateOfficeUserTask = z.infer<
    (typeof UpdateOfficeUserTaskSchema)['internal']
>
export type UpdateOfficeUserTaskTarget = UpdateOfficeUserTask['target']

export const CreateMeetingTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_MEETING,
    externalTarget: ['credential', 'workspace', 'meeting'],
    internalTarget: ['office', 'credential', 'workspace', 'meeting'],
})
export type CreateMeetingTask = z.infer<(typeof CreateMeetingTaskSchema)['internal']>
export type CreateMeetingTaskTarget = CreateMeetingTask['target']

export const UpdateMeetingTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_MEETING,
    externalTarget: ['credential', 'workspace', 'meeting'],
    internalTarget: ['office', 'credential', 'workspace', 'meeting'],
})
export type UpdateMeetingTask = z.infer<(typeof UpdateMeetingTaskSchema)['internal']>
export type UpdateMeetingTaskTarget = UpdateMeetingTask['target']

export const CreateWorkspaceTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_WORKSPACE,
    externalTarget: ['credential', 'workspace'],
    internalTarget: ['office', 'credential', 'workspace'],
})
export type CreateWorkspaceTask = z.infer<(typeof CreateWorkspaceTaskSchema)['internal']>
export type CreateWorkspaceTaskTarget = CreateWorkspaceTask['target']

export const UpdateWorkspaceTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_WORKSPACE,
    externalTarget: ['credential', 'workspace'],
    internalTarget: ['office', 'credential', 'workspace'],
})
export type UpdateWorkspaceTask = z.infer<(typeof UpdateWorkspaceTaskSchema)['internal']>
export type UpdateWorkspaceTaskTarget = UpdateWorkspaceTask['target']

export const UpdateStockholdersTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_STOCKHOLDERS,
    externalTarget: ['credential', 'workspace'],
    internalTarget: ['office', 'credential', 'workspace'],
})
export type UpdateStockholdersTask = z.infer<
    (typeof UpdateStockholdersTaskSchema)['internal']
>
export type UpdateStockholdersTaskTarget = UpdateStockholdersTask['target']

export const UpdateGovernanceTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_GOVERNANCE,
    externalTarget: ['credential', 'workspace'],
    internalTarget: ['office', 'credential', 'workspace'],
})
export type UpdateGovernanceTask = z.infer<
    (typeof UpdateGovernanceTaskSchema)['internal']
>
export type UpdateGovernanceTaskTarget = UpdateGovernanceTask['target']

export const CreateOtherPersonTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_OTHER_PERSON,
    externalTarget: ['credential', 'workspace', 'person'],
    internalTarget: ['office', 'credential', 'workspace', 'person'],
})
export type CreateOtherPersonTask = z.infer<
    (typeof CreateOtherPersonTaskSchema)['internal']
>
export type CreateOtherPersonTaskTarget = CreateOtherPersonTask['target']

export const UpdateOtherPersonTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_OTHER_PERSON,
    externalTarget: ['credential', 'workspace', 'person'],
    internalTarget: ['office', 'credential', 'workspace', 'person'],
})
export type UpdateOtherPersonTask = z.infer<
    (typeof UpdateOtherPersonTaskSchema)['internal']
>
export type UpdateOtherPersonTaskTarget = UpdateOtherPersonTask['target']

export const CreateOtherCompanyTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_OTHER_COMPANY,
    externalTarget: ['credential', 'workspace', 'company'],
    internalTarget: ['office', 'credential', 'workspace', 'company'],
})
export type CreateOtherCompanyTask = z.infer<
    (typeof CreateOtherCompanyTaskSchema)['internal']
>
export type CreateOtherCompanyTaskTarget = CreateOtherCompanyTask['target']

export const UpdateOtherCompanyTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_OTHER_COMPANY,
    externalTarget: ['credential', 'workspace', 'company'],
    internalTarget: ['office', 'credential', 'workspace', 'company'],
})
export type UpdateOtherCompanyTask = z.infer<
    (typeof UpdateOtherCompanyTaskSchema)['internal']
>
export type UpdateOtherCompanyTaskTarget = UpdateOtherCompanyTask['target']

export const CreateDocumentTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.CREATE_DOCUMENT,
    externalTarget: ['credential', 'workspace', 'document'],
    internalTarget: ['office', 'credential', 'workspace', 'document'],
})
export type CreateDocumentTask = z.infer<(typeof CreateDocumentTaskSchema)['internal']>
export type CreateDocumentTaskTarget = CreateDocumentTask['target']

export const UpdateDocumentTaskSchema = getTaskSchema({
    name: SynchronizationTaskEnum.UPDATE_DOCUMENT,
    externalTarget: ['credential', 'workspace', 'document'],
    internalTarget: ['office', 'credential', 'workspace', 'document'],
})
export type UpdateDocumentTask = z.infer<(typeof UpdateDocumentTaskSchema)['internal']>
export type UpdateDocumentTaskTarget = UpdateDocumentTask['target']

export const SynchronizationTaskOrGroupExternalUnionWithGroupSchema = pz.oneOfUnion([
    [
        SynchronizationTaskEnum.SYNCHRONIZE_OFFICE_USERS,
        SynchronizeOfficeUsersTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_OFFICE_USER,
        CreateOfficeUserTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_OFFICE_USER,
        UpdateOfficeUserTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_MEETING,
        CreateMeetingTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_MEETING,
        UpdateMeetingTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_WORKSPACE,
        CreateWorkspaceTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_WORKSPACE,
        UpdateWorkspaceTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_STOCKHOLDERS,
        UpdateStockholdersTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_GOVERNANCE,
        UpdateGovernanceTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_OTHER_PERSON,
        CreateOtherPersonTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_OTHER_PERSON,
        UpdateOtherPersonTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_OTHER_COMPANY,
        CreateOtherCompanyTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_OTHER_COMPANY,
        UpdateOtherCompanyTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.CREATE_DOCUMENT,
        CreateDocumentTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskEnum.UPDATE_DOCUMENT,
        UpdateDocumentTaskSchema.external.omit({ name: true }),
    ],
    [
        SynchronizationTaskGroupEnum.SYNCHRONIZE_FULL_WORKSPACE,
        SynchronizeFullWorkspaceTaskSchema.external.omit({ name: true }),
    ],
])

export type SynchronizationTaskOrGroupExternalUnionWithGroupSchema =
    typeof SynchronizationTaskOrGroupExternalUnionWithGroupSchema
export type SynchronizationTaskOrGroupExternalUnionWithGroup =
    z.output<SynchronizationTaskOrGroupExternalUnionWithGroupSchema>
