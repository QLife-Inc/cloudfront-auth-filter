export default {
  allowedCidrBlocks: (process.env.ALLOWED_CIDR_BLOCKS || '').split(',').map(cidr => cidr.trim()),
  authFileBucket: process.env.AUTH_FILE_S3_BUCKET || '',
  authFilePath: process.env.AUTH_FILE_S3_PREFIX || '',
  chainStrategy: process.env.AUTH_CHAIN_STRATEGY || 'or',
}
