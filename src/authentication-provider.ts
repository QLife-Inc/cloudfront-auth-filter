import { S3 } from 'aws-sdk'
import { CloudFrontRequest } from 'aws-lambda'
import { getAuthorization, getRequestHost } from './request'
import { parseAuthorizationHeader } from './authentication'
import { Cache, DiskCache, NoopCache } from './cache'

function buildObjectKey(prefix: string, domain: string, username: string) {
  if (!prefix) return `${domain}/${username}`
  return `${prefix.replace(/\/$/, '')}/${domain}/${username}`
}

async function getS3ObjectText(s3: S3, bucket: string, key: string): Promise<string | null> {
  console.debug(`Search s3://${bucket}/${key}`)
  const { Contents } = await s3.listObjectsV2({ Bucket: bucket, Prefix: key }).promise()
  const authFile = (Contents || []).find(obj => obj.Key === key)

  if (!authFile) return null

  console.debug(`GET s3://${bucket}/${authFile.Key}`)
  const { Body } = await s3.getObject({ Bucket: bucket, Key: key }).promise()
  return (Body || '').toString().trim()
}

export interface AuthenticationProvider {
  authenticate(request: CloudFrontRequest): Promise<boolean>
}

export class S3AuthenticationProvider implements AuthenticationProvider {
  readonly #s3: S3
  readonly #cache: Cache

  constructor(private readonly bucket: string, private readonly prefix = '', cacheTtl = -1) {
    this.#s3 = new S3()
    this.#cache = cacheTtl >= 0 ? new DiskCache(cacheTtl) : NoopCache
  }

  async authenticate(request: CloudFrontRequest): Promise<boolean> {
    if (!this.bucket) {
      console.info('Skip s3 file authentication because no s3 bucket is specified.')
      return false
    }

    const authorization = getAuthorization(request)
    if (!authorization) {
      console.warn('The request does not include authorization header.')
      return false
    }

    const credentials = parseAuthorizationHeader(authorization)
    if (!credentials) {
      console.warn('The authorization header is not a valid value.')
      return false
    }

    const host = getRequestHost(request)
    const password = await this.getPasswordFromS3Object(host, credentials.username)

    if (!password) {
      console.warn(`The authentication file is not found.`)
      return false
    }

    if (credentials.password !== password) {
      console.warn('The credentials is not match.')
      return false
    }

    return true
  }

  private getPasswordFromS3Object(host: string, username: string): Promise<string | null> {
    const key = buildObjectKey(this.prefix || '', host, username)
    return this.#cache.fetch(key, () => getS3ObjectText(this.#s3, this.bucket, key))
  }
}
