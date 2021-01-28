import { getAuthorization, getHeaderValue, getRequestHost } from '../../src/request'
import { CloudFrontHeaders } from 'aws-lambda'

const host = 'localhost'
const authorization = 'Basic hogehoge'

const headers: CloudFrontHeaders = {
  host: [{ value: host }],
  authorization: [{ value: authorization }],
}

describe('getHeaderValue', () => {
  it('returns header value', () => {
    const value = getHeaderValue({ headers }, 'host')
    expect(value).toEqual(host)
  })

  it('returns null when header is missing', () => {
    const value = getHeaderValue({ headers }, 'origin')
    expect(value).toBeNull()
  })

  it('returns null when index is out of range', () => {
    const value = getHeaderValue({ headers }, 'host', 2)
    expect(value).toBeNull()
  })
})

it('getRequestHost returns request host', () => {
  expect(getRequestHost({ headers })).toEqual(host)
})

it('getAuthorization returns authorization header value', () => {
  expect(getAuthorization({ headers })).toEqual(authorization)
})
