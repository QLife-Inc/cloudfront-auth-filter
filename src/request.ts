import { CloudFrontHeaders } from 'aws-lambda'

export function getHeaderValue(request: { headers: CloudFrontHeaders }, name: string, index = 0): string | null {
  if (!request.headers[name]) return null
  const headers = request.headers[name]
  if (!headers[index]) return null
  return request.headers[name][index].value
}

export function getRequestHost(request: { headers: CloudFrontHeaders }): string {
  return getHeaderValue(request, 'host') as string
}

export function getAuthorization(request: { headers: CloudFrontHeaders }): string | null {
  return getHeaderValue(request, 'authorization')
}
