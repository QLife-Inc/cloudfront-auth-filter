export type Credentials = { username: string; password: string }

export function parseAuthorizationHeader(authorization: string): Credentials | null {
  const [proto, value] = authorization.split(' ', 2)
  if (proto !== 'Basic' || !value) return null
  const credentials = Buffer.from(value, 'base64').toString('utf-8')
  const [username, password] = credentials.split(':', 2)
  return { username, password }
}
