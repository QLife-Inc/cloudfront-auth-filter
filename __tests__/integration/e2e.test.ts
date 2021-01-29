/**
 * このテストを実行するためには以下の環境変数をセットしてください。
 * AWS_ACCESS_KEY_ID
 * AWS_SECRET_ACCESS_KEY
 * AUTH_FILE_S3_BUCKET
 * AUTH_FILE_S3_PREFIX (optional)
 */
import { dummyRequest, makeDummyEvent, makeDummyRequest } from '../unit/dummy-request'
import { S3 } from 'aws-sdk'
import { CloudFrontRequest, CloudFrontResultResponse } from 'aws-lambda'
jest.mock('../../src/env')

type Credentials = { host: string; username: string; password: string }

const s3 = new S3()

const credentialsList: Credentials[] = [
  { host: 'localhost', username: 'hogehoge', password: 'p@ssw0rd' },
  { host: 'example.com', username: 'dummy', password: 'dummy' },
]

function buildObjectKey(prefix: string, credentials: Credentials) {
  if (!prefix) return `${credentials.host}/${credentials.username}`
  return `${prefix.replace(/\/$/, '')}/${credentials.host}/${credentials.username}`
}

async function writeObject(s3: S3, bucket: string, prefix: string, credentials: Credentials) {
  const Key = buildObjectKey(prefix, credentials)
  console.debug(`put s3://${bucket}/${Key}`)
  await s3.putObject({ Bucket: bucket, Key, Body: credentials.password }).promise()
}

async function deleteObject(s3: S3, bucket: string, prefix: string, credentials: Credentials) {
  const Key = buildObjectKey(prefix, credentials)
  console.debug(`delete s3://${bucket}/${Key}`)
  await s3.deleteObject({ Bucket: bucket, Key }).promise()
}

describe('E2E Test', () => {
  beforeAll(async () => {
    const bucket = process.env.AUTH_FILE_S3_BUCKET || ''
    const prefix = process.env.AUTH_FILE_S3_PREFIX || ''
    const waiters = credentialsList.map(credentials => writeObject(s3, bucket, prefix, credentials))
    await Promise.all(waiters)
  })

  afterAll(async () => {
    const bucket = process.env.AUTH_FILE_S3_BUCKET || ''
    const prefix = process.env.AUTH_FILE_S3_PREFIX || ''
    const waiters = credentialsList.map(credentials => deleteObject(s3, bucket, prefix, credentials))
    await Promise.all(waiters)
  })

  it('success for legitimate requests', async () => {
    const event = makeDummyEvent(dummyRequest)

    const { lambdaHandler } = require('../../src')
    const result = await lambdaHandler(event, {} as any, jest.fn())

    expect(isResponse(result)).toBeFalsy()
    expect(result).toMatchObject(dummyRequest)
  })

  it('success for legitimate requests', async () => {
    const event = makeDummyEvent(dummyRequest)

    const { lambdaHandler } = require('../../src')
    const result = await lambdaHandler(event, {} as any, jest.fn())

    expect(isResponse(result)).toBeFalsy()
    expect(result).toMatchObject(dummyRequest)
  })

  it('failure for illegal requests', async () => {
    const event = makeDummyEvent(makeDummyRequest('example.com', 'dummy', 'invalid'))

    const { lambdaHandler } = require('../../src')
    const result = await lambdaHandler(event, {} as any, jest.fn())

    expect(isResponse(result)).toBeTruthy()
    expect(result.status).toEqual('401')
  })
})

function isResponse(result: CloudFrontRequest | CloudFrontResultResponse): result is CloudFrontResultResponse {
  return typeof (result as any).status === 'string'
}
