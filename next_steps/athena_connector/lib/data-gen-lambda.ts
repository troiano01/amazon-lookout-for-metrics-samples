/*
Create the lambda function that will generate data
*/
import { NestedStack, NestedStackProps, Duration, ScopedAws } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Role, PolicyDocument, PolicyStatement, Effect, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

interface L4m2AthenaDataGenLambdaStackProps extends NestedStackProps {
  l4mSampleAthenaResultsBucketArn: string,
  l4mSampleAthenaDataBucketArn: string,
  workGroupKeyArn: string,
  workGroupArn: string,
  glueTableArn: string,
  glueDatabaseArn: string,
  lambdaRelativePath: string,
  lambdaMemorySize: number,
  lambdaMaxDuration: number
};

export class L4m2AthenaDataGenLambdaStack extends NestedStack {
  public readonly lambdaFunction: Function;
  constructor(scope: Construct, id: string, props: L4m2AthenaDataGenLambdaStackProps) {
    
    super(scope, id, props);

    const {
      l4mSampleAthenaResultsBucketArn, 
      l4mSampleAthenaDataBucketArn, 
      workGroupKeyArn,
      workGroupArn,
      glueTableArn,
      glueDatabaseArn,
      lambdaRelativePath,
      lambdaMemorySize,
      lambdaMaxDuration
    } = props;
    const {accountId, region} = new ScopedAws(this);

    const lambdaExecutionRolePolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({ //Logging Permissions
          effect: Effect.ALLOW,
          actions: [
            'cloudwatch:*',
            'logs:*'
          ],
          resources: ['*']
        }),
        new PolicyStatement({ //KMS Permissions
          effect: Effect.ALLOW,
          actions: [
            'kms:*'
          ],
          resources: [workGroupKeyArn]
        }),
        new PolicyStatement({ //S3 Permissions
          effect: Effect.ALLOW,
          actions: [
            's3:PutObject',
            's3:GetBucketAcl*',
            's3:ListBucket',
            's3:GetBucketLocation',
            's3:GetObject',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:AbortMultipartUpload',
            's3:PutObject',
            's3:ListMultipartUploadParts'
          ],
          resources: [
            l4mSampleAthenaResultsBucketArn,
            l4mSampleAthenaResultsBucketArn + "/*",
            l4mSampleAthenaDataBucketArn,
            l4mSampleAthenaDataBucketArn + "/*"
          ]
        }),
        new PolicyStatement({ //Athena & Glue Permissions
          effect: Effect.ALLOW,
          actions: [
            'athena:GetDataCatalog',
            'athena:StartQueryExecution',
            'glue:BatchCreatePartition',
            'glue:CreatePartition',
            'glue:GetDatabase',
            'glue:GetTable'
          ],
          resources: [
            workGroupArn,
            glueDatabaseArn,
            glueTableArn,
            'arn:aws:glue:' + region + ':' + accountId + ':catalog'
          ]
        }),
      ],
    });

    const lambdaExecutionRole = new Role(this, 'lambdaExecutionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {lambdaExecutionRolePolicy}
    });

    // lambda function definition
    this.lambdaFunction = new Function(this, 'lambda-function', {
      role: lambdaExecutionRole,
      runtime: Runtime.PYTHON_3_9,
      memorySize: lambdaMemorySize,
      timeout: Duration.seconds(lambdaMaxDuration),
      handler: 'lambda.lambda_handler',
      code: Code.fromAsset( path.join(__dirname, lambdaRelativePath))
    });
  }
}
