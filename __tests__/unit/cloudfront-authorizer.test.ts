import { CloudFrontAuthorizer } from '../../src/cloudfront-authorizer'
import { CloudFrontResultResponse } from 'aws-lambda'
import { dummyRequest } from './dummy-request'

const authenticateMock = jest.fn()
const mockProvider = { authenticate: authenticateMock }

describe(CloudFrontAuthorizer, () => {
  beforeEach(() => authenticateMock.mockReset())

  it('returns request when clientIp is in range', async () => {
    const authorizer = new CloudFrontAuthorizer(['192.168.11.0/24'], mockProvider, 'or')
    const request = { ...dummyRequest, clientIp: '192.168.11.5' }
    const result = await authorizer.authorize(request)

    expect(authenticateMock).not.toBeCalled()
    expect(result).toMatchObject(request)
  })

  it('returns request when clientIp is not in range and authenticated user', async () => {
    authenticateMock.mockImplementationOnce(() => Promise.resolve(true))

    const authorizer = new CloudFrontAuthorizer(['10.0.0.0/8'], mockProvider, 'or')
    const request = { ...dummyRequest }
    const result = await authorizer.authorize(request)

    expect(authenticateMock).lastCalledWith(request)
    expect(result).toMatchObject(request)
  })

  it('returns 401 response when clientIp is not in range and invalid user', async () => {
    authenticateMock.mockImplementationOnce(() => Promise.resolve(false))

    const authorizer = new CloudFrontAuthorizer(['10.0.0.0/8'], mockProvider, 'or')
    const request = { ...dummyRequest }
    const result = (await authorizer.authorize(request)) as CloudFrontResultResponse

    expect(authenticateMock).lastCalledWith(request)
    expect(result.status).toEqual('401')
    expect(result.headers).toBeTruthy()

    if (result.headers) {
      expect(result.headers['www-authenticate']).toMatchObject([{ key: 'WWW-Authenticate', value: 'Basic' }])
    }
  })

  it('returns 401 when clientIp is not in range and authenticated user in "AND" strategy', async () => {
    authenticateMock.mockImplementationOnce(() => Promise.resolve(true))

    const authorizer = new CloudFrontAuthorizer(['10.0.0.0/8'], mockProvider, 'AND')
    const request = { ...dummyRequest }
    const result = (await authorizer.authorize(request)) as CloudFrontResultResponse

    expect(authenticateMock).not.toBeCalled()
    expect(result.status).toEqual('401')
  })
})
