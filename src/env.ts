export default {
  allowedCidrBlocks: '%ALLOWED_CIDR_BLOCKS%'.split(',').map(cidr => cidr.trim()),
  authFileBucket: '%AUTH_FILE_S3_BUCKET%',
  authFilePath: '%AUTH_FILE_S3_PREFIX%',
}
