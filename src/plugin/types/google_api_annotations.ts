import { Proto3Extension } from '#proto3_definition/types/extension'
import { Proto3ImportedType } from '#proto3_definition/types/imported_type'
import type { RequireOneOrNone } from 'type-fest'

/**
 * Determines the URL pattern is matched by this rules. This pattern can be
 * used with any of the {get|put|post|delete|patch} methods. A custom method
 * can be defined using the 'custom' field.
 */
type GoogleApiHttpRulePatterns = {
    /**
     * Maps to HTTP GET. Used for listing and getting information about
     * resources.
     */
    get: string
    /**
     * Maps to HTTP PUT. Used for replacing a resource.
     */
    put: string
    /**
     * Maps to HTTP POST. Used for creating a resource or performing an action.
     */
    post: string
    /**
     * Maps to HTTP DELETE. Used for deleting a resource.
     */
    delete: string
    /**
     * Maps to HTTP PATCH. Used for updating a resource.
     */
    patch: string
    /**
     * The custom pattern is used for specifying an HTTP method that is not
     * included in the `pattern` field, such as HEAD, or "*" to leave the
     * HTTP method unspecified for this rule. The wild-card rule is useful
     * for services that provide content to Web (HTML) clients.
     */
    custom: {
        /**
         * The name of this custom HTTP verb.
         */
        kind: string
        /**
         * The path matched by this custom verb.
         */
        path: string
    }
}

export type GoogleApiHttpRuleCommon = {
    /**
     * Selects a method to which this rule applies.
     *
     * Refer to [selector][google.api.DocumentationRule.selector] for syntax
     * details.
     */
    selector: string
    /**
     * The name of the request field whose value is mapped to the HTTP request
     * body, or `*` for mapping all request fields not captured by the path
     * pattern to the HTTP body, or omitted for not having any HTTP request body.
     *
     * NOTE: the referred field must be present at the top-level of the request
     * message type.
     */
    body: string
    /**
     * Optional. The name of the response field whose value is mapped to the HTTP
     * response body. When omitted, the entire response message will be used
     * as the HTTP response body.
     *
     * NOTE: The referred field must be present at the top-level of the response
     * message type.
     */
    response_body: string
    /**
     * Additional HTTP bindings for the selector. Nested bindings must
     * not contain an `additional_bindings` field themselves (that is,
     * the nesting may only be one level deep).
     */
    additional_bindings: GoogleApiHttpRule[]
}

export type GoogleApiHttpRule = RequireOneOrNone<
    GoogleApiHttpRulePatterns,
    'get' | 'put' | 'post' | 'delete' | 'patch' | 'custom'
> &
    Partial<GoogleApiHttpRuleCommon>

export const Proto3HttpAnnotation = {
    useType: () => {
        return Proto3ImportedType.new({
            importPath: 'google/api/annotations.proto',
            typeReference: 'google.api.http',
        })
    },
    useExtension: (value: GoogleApiHttpRule) => {
        return Proto3Extension.new({
            key: Proto3HttpAnnotation.useType(),
            value,
        })
    },
} as const
