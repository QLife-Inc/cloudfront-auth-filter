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

export class CloudFrontAuthorizer {
  readonly #allowedCidrBlocks: CidrBlocks

  constructor(allowedCidrBlocks: string[], private readonly authProvider: AuthenticationProvider) {
    this.#allowedCidrBlocks = new CidrBlocks(allowedCidrBlocks)
  }

  async authorize(request: CloudFrontRequest): Promise<CloudFrontRequest | CloudFrontResultResponse> {
    if (this.#allowedCidrBlocks.contains(request.clientIp)) {
      return request
    }

    console.warn(`The client ip '${request.clientIp}' is not allowed.`)

    if (await this.authProvider.authenticate(request)) {
      return request
    }

    return unauthorizedResponse
  }
}
