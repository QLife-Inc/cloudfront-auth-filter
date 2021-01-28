export default {
  allowedCidrBlocks: (process.env.ALLOWED_CIDR_BLOCKS || '10.0.0.0/8').split(',').map(cidr => cidr.trim()),
  authFileBucket: process.env.AUTH_FILE_S3_BUCKET || 'dummy',
  authFilePath: process.env.AUTH_FILE_S3_PREFIX || '',
}
