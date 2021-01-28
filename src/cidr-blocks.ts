import CidrBlock from 'ip-cidr'

export class CidrBlocks {
  readonly #cidrBlocks: CidrBlock[]

  constructor(cidrBlocks: string[]) {
    const validCidrBlocks: CidrBlock[] = []
    const errors: string[] = []

    for (const cidr of cidrBlocks) {
      const cidrBlock = new CidrBlock(cidr)
      if (cidrBlock.isValid()) {
        validCidrBlocks.push(cidrBlock)
      } else {
        errors.push(cidr)
      }
    }

    if (errors.length > 0) {
      throw new Error('Invalid cidr block: ' + errors.join(', '))
    }

    this.#cidrBlocks = validCidrBlocks
  }

  contains(address: string): boolean {
    return this.#cidrBlocks.some(cidr => cidr.contains(address))
  }
}
