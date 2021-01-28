import { S3 } from 'aws-sdk'
import { CloudFrontRequest } from 'aws-lambda'
import { getAuthorization, getRequestHost } from './request'
import { Credentials, parseAuthorizationHeader } from './authentication'

function getCredentialsFromRequest(request: CloudFrontRequest): Credentials | null {
  const authorization = getAuthorization(request)
  if (!authorization) return null
  return parseAuthorizationHeader(authorization)
}

function buildObjectKey(prefix: string, domain: string, username: string) {
  if (!prefix) return `${domain}/${username}`
  return `${prefix.replace(/\/$/, '')}/${domain}/${username}`
}

async function getS3ObjectText(s3: S3, bucket: string, key: string): Promise<string | null> {
  try {
    const response = await s3.getObject({ Bucket: bucket, Key: key }).promise()
    return (response.Body || '').toString()
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 403) return null
    throw e
  }
}

export interface AuthenticationProvider {
  authenticate(request: CloudFrontRequest): Promise<boolean>
}

export class S3AuthenticationProvider implements AuthenticationProvider {
  readonly #s3: S3

  constructor(private readonly bucket: string, private readonly prefix?: string) {
    this.#s3 = new S3()
  }

  async authenticate(request: CloudFrontRequest): Promise<boolean> {
    const credentials = getCredentialsFromRequest(request)
    if (!credentials) return false

    const host = getRequestHost(request)
    const password = await this.getPasswordFromS3Object(host, credentials.username)

    return credentials.password === password
  }

  private getPasswordFromS3Object(host: string, username: string): Promise<string | null> {
    const key = buildObjectKey(this.prefix || '', host, username)
    console.debug(`get s3://${this.bucket}/${key}`)
    return getS3ObjectText(this.#s3, this.bucket, key)
  }
}
