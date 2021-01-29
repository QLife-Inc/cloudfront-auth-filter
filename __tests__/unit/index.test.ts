import { CloudFrontRequest } from 'aws-lambda'
import { dummyHost, dummyPassword, dummyRequest, dummyUser, makeDummyEvent } from './dummy-request'
import { mockGetObjectOnce } from './mock-get-object'
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
    process.env.AUTH_FILE_S3_PREFIX = 'dummy/'

    const event = makeDummyEvent(dummyRequest)
    const getObject = mockGetObjectOnce(dummyPassword)

    const { lambdaHandler } = require('../../src')
    const promise = lambdaHandler(event, {} as any, jest.fn()) as Promise<CloudFrontRequest>

    const result = await promise
    expect(result).toMatchObject(dummyRequest)
    expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `dummy/${dummyHost}/${dummyUser}` })
  })
})
