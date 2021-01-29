import { CidrBlocks } from '../../src/cidr-blocks'

const validCidrBlocks = ['172.17.0.0/16', '192.168.100.0/24']

describe(CidrBlocks, () => {
  it('is created from a list of cidr strings', () => {
    const cidrBlocks = new CidrBlocks(validCidrBlocks)
    expect(cidrBlocks).toBeInstanceOf(CidrBlocks)
  })

  it('raise error when have invalid cidr strings', () => {
    const invalidCidrBlocks = ['127.0.0.1', '123.4.5.6.7', '10.25.0.0/36', 'invalid cidr string']
    const cidrBlocks = [...validCidrBlocks, ...invalidCidrBlocks]
    expect(() => new CidrBlocks(cidrBlocks)).toThrowError(invalidCidrBlocks.join(', '))
  })

  it('can determine if the target ip address is contained', () => {
    const cidrBlocks = new CidrBlocks(validCidrBlocks)
    expect(cidrBlocks.contains('172.17.2.25')).toBeTruthy()
    expect(cidrBlocks.contains('172.18.0.1')).toBeFalsy()
    expect(cidrBlocks.contains('192.168.100.10')).toBeTruthy()
    expect(cidrBlocks.contains('192.168.99.1')).toBeFalsy()
  })
})
