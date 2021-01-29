import { PromiseResult } from 'aws-sdk/lib/request'
import { GetObjectOutput, ListObjectsV2Output } from 'aws-sdk/clients/s3'
import { AWSError } from 'aws-sdk'

type GetObjectResult = PromiseResult<GetObjectOutput, AWSError>

export function mockGetObjectOnce(password: string) {
  const getObjectResult: GetObjectResult = { $response: 'dummy' as any, Body: password }
  const promise = jest.fn(() => Promise.resolve(getObjectResult))
  return jest.fn(() => ({ promise }))
}

export function mockListObjectV2Once(key: string) {
  const listObjectV2Result: ListObjectsV2Output = {
    Contents: [{ Key: key }],
  }
  const promise = jest.fn(() => Promise.resolve(listObjectV2Result))
  return jest.fn(() => ({ promise }))
}
