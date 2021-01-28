import { parseAuthorizationHeader } from '../../src/authentication'

describe('parseAuthorizationHeader', () => {
  it('returns credentials when authorization header is valid', () => {
    const [username, password] = ['hoge-user', 'hoge-password']
    const headerValue = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
    const credentials = parseAuthorizationHeader(headerValue)
    expect(credentials?.username).toEqual(username)
    expect(credentials?.password).toEqual(password)
  })

  it('returns null when authorization header is invalid', () => {
    expect(parseAuthorizationHeader('hoge')).toBeNull()
    expect(parseAuthorizationHeader('Basic')).toBeNull()
  })
})
