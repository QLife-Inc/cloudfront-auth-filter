import { CloudFrontRequestHandler } from 'aws-lambda'
import { S3AuthenticationProvider } from './authentication-provider'
import { CloudFrontAuthorizer } from './cloudfront-authorizer'
import env from './env'

const provider = new S3AuthenticationProvider(env.authFileBucket, env.authFilePath, env.cacheTtl)
const authorizer = new CloudFrontAuthorizer(env.allowedCidrBlocks, provider, env.chainStrategy)

export const lambdaHandler: CloudFrontRequestHandler = event => {
  const request = event.Records[0].cf.request
  return authorizer.authorize(request)
}
