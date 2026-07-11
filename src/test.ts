import { ServiceDefinition as GrpcJsServiceDefinition } from '@grpc/grpc-js'
import { ServiceDefinition as NiceGrpcServiceDefinition } from 'nice-grpc'
import * as protobuf from 'protobufjs'

// Define the root namespace
const root = new protobuf.Root()

// Define the messages using reflection
const TargetWorkspace = new protobuf.Type('TargetWorkspace').add(
    new protobuf.Field('external_id', 1, 'string', { rule: 'required' })
)

const TargetCredential = new protobuf.Type('TargetCredential').add(
    new protobuf.Field('external_id', 1, 'string', { rule: 'required' })
)

const UpdateWorkspaceTarget = new protobuf.Type('UpdateWorkspaceTarget')
    .add(new protobuf.Field('credential', 1, 'TargetCredential', { rule: 'required' }))
    .add(new protobuf.Field('workspace', 2, 'TargetWorkspace', { rule: 'required' }))

const UpdateWorkspaceTask = new protobuf.Type('UpdateWorkspaceTask').add(
    new protobuf.Field('target', 1, 'UpdateWorkspaceTarget', { rule: 'required' })
)

const CreateWorkspaceTarget = new protobuf.Type('CreateWorkspaceTarget')
    .add(new protobuf.Field('credential', 1, 'TargetCredential', { rule: 'required' }))
    .add(new protobuf.Field('workspace', 2, 'TargetWorkspace', { rule: 'required' }))

const CreateWorkspaceTask = new protobuf.Type('CreateWorkspaceTask').add(
    new protobuf.Field('target', 1, 'CreateWorkspaceTarget', { rule: 'required' })
)

const SynchronizeUsersTarget = new protobuf.Type('SynchronizeUsersTarget').add(
    new protobuf.Field('workspace', 1, 'TargetWorkspace', { rule: 'required' })
)

const SynchronizeUsersTask = new protobuf.Type('SynchronizeUsersTask').add(
    new protobuf.Field('target', 1, 'SynchronizeUsersTarget', { rule: 'required' })
)

const PostAsyncTasksInputTask = new protobuf.Type('PostAsyncTasksInputTask').add(
    new protobuf.OneOf('task', [
        new protobuf.Field('synchronize_users', 1, 'SynchronizeUsersTask', {
            rule: 'required',
        }),
        new protobuf.Field('create_workspace', 2, 'CreateWorkspaceTask', {
            rule: 'required',
        }),
        new protobuf.Field('update_workspace', 3, 'UpdateWorkspaceTask', {
            rule: 'required',
        }),
    ])
)

const PostAsyncTasksInput = new protobuf.Type('PostAsyncTasksInput').add(
    new protobuf.Field('tasks', 1, 'PostAsyncTasksInputTask', {
        repeated: true,
        rule: 'required',
    })
)

// Optionally, you can add the service definition if needed
const SynchronizationService = new protobuf.Service('SynchronizationService').add(
    new protobuf.Method(
        'PostAsyncTasks',
        'rpc', // jsp ptdr
        'PostAsyncTasksInput',
        'google.protobuf.Empty',
        false, //request stream
        false, //response stream
        {}, // options
        'comments',
        {} // parsedOptions
    )
)

// Define the package and add all types
root.define('services.synchronization.v1')
    .add(TargetWorkspace)
    .add(TargetCredential)
    .add(UpdateWorkspaceTarget)
    .add(UpdateWorkspaceTask)
    .add(CreateWorkspaceTarget)
    .add(CreateWorkspaceTask)
    .add(SynchronizeUsersTarget)
    .add(SynchronizeUsersTask)
    .add(PostAsyncTasksInputTask)
    .add(PostAsyncTasksInput)
    .add(SynchronizationService)

const SynchronizationServiceProto = root.lookupService(
    'services.synchronization.v1.SynchronizationService'
)

// SynchronizationServiceProto.methods['dd'].r

const grpcServiceDefinition: GrpcJsServiceDefinition = {
    postAsyncTasks: {
        path: '/services.synchronization.v1.SynchronizationService/PostAsyncTasks',
        requestStream: false,
        responseStream: false,
        requestSerialize: (value: Record<string, unknown>) => {
            const message = SynchronizationServiceProto.methods[
                'PostAsyncTasks'
            ]?.resolvedRequestType
                ?.encode(value)
                .finish()

            return message as any
        },
        requestDeserialize: (value: Uint8Array<ArrayBufferLike>) => {
            const message =
                SynchronizationServiceProto.methods[
                    'PostAsyncTasks'
                ]?.resolvedRequestType?.decode(value)
            // TODO: .toJSON() utile?

            return message
        },
        responseSerialize: (value: Record<string, unknown>) => {
            const message = SynchronizationServiceProto.methods[
                'PostAsyncTasks'
            ]?.resolvedResponseType
                ?.encode(value)
                .finish()

            return message as any
        },
        responseDeserialize: (value: Uint8Array<ArrayBufferLike>) => {
            const message =
                SynchronizationServiceProto.methods[
                    'PostAsyncTasks'
                ]?.resolvedResponseType?.decode(value)
            // TODO: .toJSON() utile?

            return message
        },
    },
}

const nicegrpcServiceDefinition: NiceGrpcServiceDefinition = {
    postAsyncTasks: {
        path: '/services.synchronization.v1.SynchronizationService/PostAsyncTasks',
        requestStream: false,
        responseStream: false,
        requestSerialize: (value: Record<string, unknown>) => {
            return PostAsyncTasksInputTask.encode(value).finish()

            // const message = SynchronizationServiceProto.methods[
            //     'PostAsyncTasks'
            // ]?.resolvedRequestType
            //     ?.encode(value)
            //     .finish()!

            // return message
        },
        requestDeserialize: (value: Uint8Array<ArrayBufferLike>) => {
            return PostAsyncTasksInputTask.decode(value)

            // const message =
            //     SynchronizationServiceProto.methods[
            //         'PostAsyncTasks'
            //     ]?.resolvedRequestType?.decode(value)
            // // TODO: .toJSON() utile?

            // return message
        },
        responseSerialize: (value: Record<string, unknown>) => {
            const message = SynchronizationServiceProto.methods[
                'PostAsyncTasks'
            ]?.resolvedResponseType
                ?.encode(value)
                .finish()!

            return message
        },
        responseDeserialize: (value: Uint8Array<ArrayBufferLike>) => {
            const message =
                SynchronizationServiceProto.methods[
                    'PostAsyncTasks'
                ]?.resolvedResponseType?.decode(value)
            // TODO: .toJSON() utile?

            return message
        },
        options: {},
    },
}

// SynchronizationService.resolveAll().methods

// const SynchronizationServiceProto = root.lookupService(
//     'services.synchronization.v1.SynchronizationService'
// )

// Load google/protobuf/empty.proto and buf/validate/validate.proto if needed
// This is usually done via root.loadSync() or root.load()

// Example usage:
// const message = PostAsyncTasksInput.create({ tasks: [...] });
// const buffer = PostAsyncTasksInput.encode(message).finish();
