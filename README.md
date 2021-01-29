# cloudfront-auth-filter

AWS Lambda@Edge function for authentication and authorization with Amazon CloudFront.

## Features

- Client IP restrictions in whitelist
- Basic authentication on denied Client IP
- Authentication file uses s3 object

## Deploy

### 1. Setup local machine

Install the required tools.

- [sam-local-cli](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Node.js 12+
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

Execute the command at the project root.

```bash
yarn install # or npm install
```

### 2. Build sources

Environment variables cannot be used with Lambda@Edge, so embed them at build time.  
Below is an example.

```bash
export ALLOWED_CIDR_BLOCKS=10.25.0.0/8,192.168.11.0/24
export AUTH_FILE_S3_BUCKET=your-s3-bucket
export AUTH_FILE_S3_PREFIX=cf-auth/htpasswd/
yarn build
```

#### Variables description

| name | description | default | example |
| --- | --- | --- | --- |
| ALLOWED_CIDR_BLOCKS | アクセスを許可する IP アドレスの範囲を示す CIDR ブロック。カンマ区切りで複数指定可能。 | '127.0.0.1/32' | '10.5.0.0/16, 172.43.16.0/21' |
| AUTH_FILE_S3_BUCKET | 認証ファイルが格納されている S3 バケット。未指定の場合は IP アドレス制限のみ行う。 | '' |  'my-cf-auth-bucket' |
| AUTH_FILE_S3_PREFIX | 認証ファイルが格納されている S3 バケットのプレフィクス。先頭にスラッシュを付けてはいけない。末尾スラッシュはあってもなくても可（ありに正規化される）。 | '' | 'cloudfront/htpasswd/' |
| AUTH_CHAIN_STRATEGY | IP 制限 `OR` Basic 認証なのか、IP 制限 `AND` Basic 認証なのかを選択。許可される値は `or` もしくは `and` （大文字小文字区別なし）。 | 'or' | 'And' |

### 3. Upload the authorization file to s3

The content of the file is a plaintext password.  
Place a file with a plaintext password in s3 for each user by host name.

```
your-s3-bucket
  └ your-s3-prefix
      ├ example.com
      │  ├ user1
      │  ├ user2
      │  └ user3 ...
      ├ test.com
      │  └ user4 ...
      └ ...
```

### 4. Edit samconfig.toml

Edit samconfig.toml for your environment.

```bash
cp samconfig.example.toml samconfig.toml
$EDITOR samconfig.toml
```

Edit `template.yml` if you need more customization.

### 5. Deploy function

Be sure to deploy to `us-east-1` region.

```bash
sam deploy --region us-east-1
```

### 6. Associate function to CloudFront Distribution

Associate Lambda@Edge function to CloudFront distribution's `viewer-request` using the management console or aws cli.

## Tests

Unit test

```bash
yarn test
```

Integration test

```bash
export AWS_ACCESS_KEY_ID=xxxxxxxxxxxxxxx
export AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxx
export AUTH_FILE_S3_BUCKET=your-s3-bucket
export AUTH_FILE_S3_PREFIX=test/cf-auth/htpasswd/
yarn integ-test
```
