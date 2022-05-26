/*

*/
import { Stack, StackProps, ScopedAws } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GlueStack } from '../lib/glue-table';
import { S3BucketStack } from '../lib/s3-bucket';
import { WorkGroupStack } from '../lib/athena-workgroup';
import { AccessRoleStack } from '../lib/access-role';
import { L4m2AthenaDataGenLambdaStack } from '../lib/data-gen-lambda';
import { L4m2AthenaSchedLambdaEventStack } from '../lib/sched-lambda-event';

export class L4mAthenaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('dev');
    const {accountId} = new ScopedAws(this);

    const resultsBucketStack = new S3BucketStack(this, 'resultsBucketStack', {
      bucketName: env.resultsBucketName
    });

    const dataBucketStack = new S3BucketStack(this, 'dataBucketStack', {
      bucketName: env.dataBucketName
    });

    const workGroupStack = new WorkGroupStack(this, 'workGroupStack', {
      workGroupName: env.workGroupName,
      outputLocation: 's3://' + resultsBucketStack.s3Bucket.bucketName + '/athena-query-results/'
    });

    const glueStack = new GlueStack(this, 'glueStack', {
      glueDatabaseName: env.glueDatabaseName,
      glueTableName: env.glueTableName,
      tableStorageLocation: 's3://' + dataBucketStack.s3Bucket.bucketName  + '/' + env.s3BucketPrefix + '/'
    });

    const l4m2AthenaDataGenLambdaStack = new L4m2AthenaDataGenLambdaStack(this, 'l4m2AthenaDataGenLambdaStack', {
      l4mSampleAthenaResultsBucketArn: resultsBucketStack.s3Bucket.bucketArn,
      l4mSampleAthenaDataBucketArn: dataBucketStack.s3Bucket.bucketArn,
      workGroupKeyArn: workGroupStack.workGroupKeyArn,
      workGroupArn: workGroupStack.workGroupArn,
      glueTableArn: glueStack.glueTableArn,
      glueDatabaseArn: glueStack.glueDatabaseArn,
      lambdaRelativePath: env.lambdaRelativePath,
      lambdaMemorySize: env.lambdaMemorySize,
      lambdaMaxDuration: env.lambdaMaxDuration
    });

    const l4m2AthenaSchedLambdaEventStack = new L4m2AthenaSchedLambdaEventStack(this, 'l4m2AthenaSchedLambdaEventStack', {
      lambdaFunction: l4m2AthenaDataGenLambdaStack.lambdaFunction,
      eventRuleFrequency: env.eventRuleFrequency,
      enabled: env.eventEnabled,
      dataBucketName: dataBucketStack.s3Bucket.bucketName,
      bucketPrefix: env.s3BucketPrefix,
      databaseName: env.glueDatabaseName,
      tableName: env.glueTableName,
      workGroupName: env.workGroupName,
      detectorFrequency: env.detectorFrequency,
      historicalDataPoints: env.historicalDataPoints,
      futureDataPoints: env.futureDataPoints
    });
  }
}
