import { CloudFrontRequest } from 'aws-lambda'
import { dummyHost, dummyPassword, dummyRequest, dummyUser, makeDummyEvent } from './dummy-request'
import { mockGetObjectOnce, mockListObjectV2Once } from './mock-s3-api'
import { mocked } from 'ts-jest/utils'
import { S3 } from 'aws-sdk'
jest.mock('aws-sdk')
jest.mock('../../src/env')

describe('Lambda handler', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('run authorization and authentication for request', async () => {
    process.env.ALLOWED_CIDR_BLOCKS = '10.0.0.0/8'
    process.env.AUTH_FILE_S3_BUCKET = 'dummy'
    process.env.AUTH_FILE_S3_PREFIX = `${new Date().getTime() * Math.random()}/`

    const dummyKey = `${process.env.AUTH_FILE_S3_PREFIX}${dummyHost}/${dummyUser}`

    const event = makeDummyEvent(dummyRequest)
    const listObjectsV2 = mockListObjectV2Once(dummyKey)
    const getObject = mockGetObjectOnce(dummyPassword)
    mocked(S3).mockImplementationOnce((): any => ({ listObjectsV2, getObject }))

    const { lambdaHandler } = require('../../src')
    const promise = lambdaHandler(event, {} as any, jest.fn()) as Promise<CloudFrontRequest>

    const result = await promise
    expect(result).toMatchObject(dummyRequest)
    expect(listObjectsV2).lastCalledWith({ Bucket: 'dummy', Prefix: dummyKey })
    expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: dummyKey })
  })
})
