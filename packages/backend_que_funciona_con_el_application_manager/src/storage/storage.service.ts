import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import { getSignedUrl as _getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService extends S3 {
  private readonly s3: S3;

  constructor(private readonly configService: ConfigService) {
    super({
      credentials: {
        accessKeyId: configService.getOrThrow('S3_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow('S3_SECRET_ACCESS_KEY'),
      },
      region: configService.getOrThrow('S3_REGION'),
      endpoint: configService.getOrThrow('S3_ENDPOINT'),
      forcePathStyle: true,
    });
  }

  async generateGetSignedUrl(opts: {
    s3Key: string;
    expires?: number;
    contentType?: string;
  }) {
    const params: GetObjectCommandInput = {
      Bucket: this.configService.getOrThrow('S3_PRIVATE_BUCKET_NAME'),
      Key: opts.s3Key,
      // @ts-expect-error
      Expires: opts.expires || 60 * 5,
      ResponseContentType: opts?.contentType || undefined,
    };
    const command = new GetObjectCommand(params);

    return _getSignedUrl(this, command);
  }
}
