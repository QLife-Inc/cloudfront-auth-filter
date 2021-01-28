import { PromiseResult } from 'aws-sdk/lib/request'
import { GetObjectOutput } from 'aws-sdk/clients/s3'
import { AWSError, S3 } from 'aws-sdk'
import { mocked } from 'ts-jest/utils'

type GetObjectResult = PromiseResult<GetObjectOutput, AWSError>

function mockErrorPromise(statusCode: number): () => Promise<any> {
  return jest.fn(() => Promise.reject({ statusCode }))
}

function mockGetObjectPromise(getObjectResult: GetObjectResult): () => Promise<any> {
  return jest.fn(() => Promise.resolve(getObjectResult))
}

export function mockGetObjectOnce(password: string, statusCode = 0) {
  const getObjectResult: GetObjectResult = { $response: 'dummy' as any, Body: password }
  const promise = statusCode !== 0 ? mockErrorPromise(statusCode) : mockGetObjectPromise(getObjectResult)
  const getObject = jest.fn(() => ({ promise }))
  mocked(S3).mockImplementationOnce((): any => ({ getObject }))
  return getObject
}
