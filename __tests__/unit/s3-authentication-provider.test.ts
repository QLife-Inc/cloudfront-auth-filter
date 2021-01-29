import { S3AuthenticationProvider } from '../../src/authentication-provider'
import { dummyHost, dummyPassword, dummyRequest, dummyUser } from './dummy-request'
import { mockGetObjectOnce } from './mock-get-object'
jest.mock('aws-sdk')

describe(S3AuthenticationProvider, () => {
  describe('#authenticate', () => {
    it('returns true when authorization header is valid', async () => {
      const getObject = mockGetObjectOnce(dummyPassword)

      const provider = new S3AuthenticationProvider('dummy')
      expect(await provider.authenticate(dummyRequest)).toBeTruthy()

      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `${dummyHost}/${dummyUser}` })
    })

    it('returns false when authorization header is invalid', async () => {
      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      const request = { ...dummyRequest, headers: { authorization: [{ value: 'Hoge' }] } }
      expect(await provider.authenticate(request)).toBeFalsy()
    })

    it('returns false when no authorization header', async () => {
      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate({ ...dummyRequest, headers: {} })).toBeFalsy()
    })

    it('returns false when object is missing', async () => {
      const getObject = mockGetObjectOnce('error', 404)

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `dummy/${dummyHost}/${dummyUser}` })
    })

    it('returns false when object body is empty', async () => {
      const getObject = mockGetObjectOnce('')

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `dummy/${dummyHost}/${dummyUser}` })
    })

    it('returns false when s3 object not permitted', async () => {
      const getObject = mockGetObjectOnce('error', 403)

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `dummy/${dummyHost}/${dummyUser}` })
    })

    it('throws error when occurred s3:getObject error', async () => {
      const getObject = mockGetObjectOnce('error', 500)

      const provider = new S3AuthenticationProvider('dummy', 'dummy')

      try {
        await provider.authenticate(dummyRequest)
        fail('error was not thrown')
      } catch (e) {
        expect(e?.statusCode).toEqual(500)
      }

      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: `dummy/${dummyHost}/${dummyUser}` })
    })

    it('skip authentication when bucket is empty', async () => {
      const getObject = mockGetObjectOnce('error', 500)

      const provider = new S3AuthenticationProvider('', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(getObject).not.toBeCalled()
    })
  })
})
