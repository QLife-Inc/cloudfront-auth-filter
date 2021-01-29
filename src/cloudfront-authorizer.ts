import { CloudFrontRequest, CloudFrontResultResponse } from 'aws-lambda'
import { CidrBlocks } from './cidr-blocks'
import { AuthenticationProvider } from './authentication-provider'

const unauthorizedResponse = {
  status: '401',
  statusDescription: 'Unauthorized',
  body: 'Unauthorized',
  headers: {
    'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic' }],
  },
}

enum AuthChainStrategy {
  OR = 'or',
  AND = 'and',
}

function toAuthChainStrategy(value: string) {
  if (value.toLowerCase() === AuthChainStrategy.AND) {
    return AuthChainStrategy.AND
  }
  return AuthChainStrategy.OR
}

export class CloudFrontAuthorizer {
  readonly #allowedCidrBlocks: CidrBlocks
  readonly #chainStrategy: AuthChainStrategy

  constructor(allowedCidrBlocks: string[], private readonly authProvider: AuthenticationProvider, strategy: string) {
    this.#allowedCidrBlocks = new CidrBlocks(allowedCidrBlocks)
    this.#chainStrategy = toAuthChainStrategy(strategy)
  }

  async authorize(request: CloudFrontRequest): Promise<CloudFrontRequest | CloudFrontResultResponse> {
    if (this.#allowedCidrBlocks.contains(request.clientIp)) {
      return request
    }

    if (this.#chainStrategy === AuthChainStrategy.AND) {
      console.warn(`The client ip '${request.clientIp}' is not allowed.`)
      return unauthorizedResponse
    }

    if (await this.authProvider.authenticate(request)) {
      return request
    }

    return unauthorizedResponse
  }
}
