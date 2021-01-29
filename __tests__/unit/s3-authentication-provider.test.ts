import { S3AuthenticationProvider } from '../../src/authentication-provider'
import { dummyHost, dummyPassword, dummyRequest, dummyUser } from './dummy-request'
import { mockGetObjectOnce, mockListObjectV2Once } from './mock-s3-api'
import { mocked } from 'ts-jest/utils'
import { S3 } from 'aws-sdk'
jest.mock('aws-sdk')

const dummyKey = `dummy/${dummyHost}/${dummyUser}`

describe(S3AuthenticationProvider, () => {
  describe('#authenticate', () => {
    it('returns true when authorization header is valid', async () => {
      const key = `${dummyHost}/${dummyUser}`

      const listObjectsV2 = mockListObjectV2Once(key)
      const getObject = mockGetObjectOnce(dummyPassword)
      mocked(S3).mockImplementationOnce((): any => ({ listObjectsV2, getObject }))

      const provider = new S3AuthenticationProvider('dummy')
      expect(await provider.authenticate(dummyRequest)).toBeTruthy()

      expect(listObjectsV2).lastCalledWith({ Bucket: 'dummy', Prefix: key })
      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: key })
    })

    it('returns false when credentials is not match', async () => {
      const listObjectsV2 = mockListObjectV2Once(dummyKey)
      const getObject = mockGetObjectOnce('hoge')
      mocked(S3).mockImplementationOnce((): any => ({ listObjectsV2, getObject }))

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(listObjectsV2).lastCalledWith({ Bucket: 'dummy', Prefix: dummyKey })
      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: dummyKey })
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
      const listObjectsV2 = mockListObjectV2Once('difference-key')
      const getObject = mockGetObjectOnce(dummyPassword)
      mocked(S3).mockImplementationOnce((): any => ({ listObjectsV2 }))

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(listObjectsV2).lastCalledWith({ Bucket: 'dummy', Prefix: dummyKey })
      expect(getObject).not.toBeCalled()
    })

    it('returns false when object body is empty', async () => {
      const listObjectsV2 = mockListObjectV2Once(dummyKey)
      const getObject = mockGetObjectOnce('')
      mocked(S3).mockImplementationOnce((): any => ({ listObjectsV2, getObject }))

      const provider = new S3AuthenticationProvider('dummy', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(listObjectsV2).lastCalledWith({ Bucket: 'dummy', Prefix: dummyKey })
      expect(getObject).lastCalledWith({ Bucket: 'dummy', Key: dummyKey })
    })

    it('skip authentication when bucket is empty', async () => {
      const listObjectsV2 = mockListObjectV2Once(dummyKey)
      const getObject = mockGetObjectOnce('skip')
      mocked(S3).mockImplementationOnce((): any => ({ getObject }))

      const provider = new S3AuthenticationProvider('', 'dummy')
      expect(await provider.authenticate(dummyRequest)).toBeFalsy()

      expect(listObjectsV2).not.toBeCalled()
      expect(getObject).not.toBeCalled()
    })
  })
})
