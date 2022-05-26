/*
Generalized bucket creation. Creates a non-public s3 bucket suffixed with the region and account id.
- no versioning
- 30 day object persistence, with auto-delete
*/
import { NestedStack, NestedStackProps, RemovalPolicy, Duration, ScopedAws } from 'aws-cdk-lib';
import { Construct } from 'constructs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';

interface S3BucketStackProps extends NestedStackProps {
  bucketName: string
}

export class S3BucketStack extends NestedStack {
  public readonly s3Bucket: Bucket;
  constructor(scope: Construct, id: string, props: S3BucketStackProps) {
    super(scope, id, props);

    const {bucketName} = props;
    const {accountId, region} = new ScopedAws(this);
    
    this.s3Bucket = new Bucket(this, 's3Bucket', {
      bucketName: bucketName + '-' + region + '-' + accountId,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: false,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(30)
        }
      ]
    });
  }
}
