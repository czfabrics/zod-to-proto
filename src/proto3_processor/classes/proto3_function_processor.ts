import { fileContentMatter } from '#file/classes/content_matter'
import type { FreshFileContentMatter } from '#file/types/content_matter'
import { Proto3RpcFunction } from '#proto3_definition/types/functions'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import { AnyProto3Message } from '#proto3_definition/types/messages'
import { match } from 'ts-pattern'

export class Proto3FunctionProcessor {
    public constructor(private readonly content: FreshFileContentMatter) {}

    private getTypeReferenceString(item: AnyProto3Message | Proto3ImportedType): string {
        return match(item)
            .returnType<string>()
            .with(
                { internalName: 'enum' },
                { internalName: 'message' },
                (message) => message.name
            )
            .with({ internalName: 'imported' }, (imported) => imported.typeReference)
            .exhaustive()
    }

    public process(rpcFunction: Proto3RpcFunction): void {
        const inTypeReference = this.getTypeReferenceString(rpcFunction.in)
        const outTypeReference = this.getTypeReferenceString(rpcFunction.out)

        this.content
            .write(
                `rpc ${rpcFunction.name}(${inTypeReference}) returns (${outTypeReference}) `
            )
            .writeBlock(fileContentMatter())
    }
}
