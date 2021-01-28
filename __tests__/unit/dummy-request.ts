import { CloudFrontRequest, CloudFrontRequestEvent } from 'aws-lambda'

export const dummyHost = 'localhost'
export const dummyUser = 'hogehoge'
export const dummyPassword = 'p@ssw0rd'

export function makeDummyRequest(host: string, user: string, password: string): CloudFrontRequest {
  const credentials = Buffer.from(user + ':' + password).toString('base64')
  return {
    clientIp: '192.168.11.1',
    headers: {
      host: [{ value: host }],
      authorization: [{ value: 'Basic ' + credentials }],
    },
    // dummy (not use)
    method: 'get',
    querystring: '',
    uri: '/',
  }
}

export function makeDummyEvent(request: CloudFrontRequest): CloudFrontRequestEvent
export function makeDummyEvent(host: string, user: string, password: string): CloudFrontRequestEvent
export function makeDummyEvent(
  hostOrRequest: string | CloudFrontRequest,
  user?: string,
  password?: string
): CloudFrontRequestEvent {
  if (typeof hostOrRequest === 'object') {
    return { Records: [{ cf: { request: hostOrRequest, config: {} as any } }] }
  }
  const request = makeDummyRequest(hostOrRequest, user || '', password || '')
  return { Records: [{ cf: { request, config: {} as any } }] }
}

export const dummyRequest = makeDummyRequest(dummyHost, dummyUser, dummyPassword)
