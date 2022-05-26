/*
Create the access role that is automatically created by the athena data source creation 
in case it is needed. It is not built by the root stack yet, but will be included when
there is CloudFormation support for L4M Athena Connector.
*/
import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Role, PolicyDocument, PolicyStatement, Effect, ServicePrincipal, CompositePrincipal } from 'aws-cdk-lib/aws-iam';

interface AccessRoleStackProps extends NestedStackProps {
  glueDatabaseArn: string;
  glueTableArn: string;
  glueCatalogArn: string;
  workGroupArn: string;
  resultsBucketArn: string;
  dataBucketArn: string;
}

export class AccessRoleStack extends NestedStack {
  public readonly testingAccessRole: Role;
  constructor(scope: Construct, id: string, props: AccessRoleStackProps) {
    super(scope, id, props);

    const {glueDatabaseArn, glueTableArn, glueCatalogArn, workGroupArn, resultsBucketArn, dataBucketArn} = props;

    const testingAccessRolePolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({ // Set access to Amazon Glue resources
          effect: Effect.ALLOW,
          actions: [
            'glue:GetTable',
            'glue:GetDatabase',
            'glue:GetPartitions'
          ],
          resources: [
            glueCatalogArn,
            glueDatabaseArn,
            glueTableArn
          ]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'athena:CreatePreparedStatement',
            'athena:GetPreparedStatement',
            'athena:GetQueryResultsStream',
            'athena:DeletePreparedStatement',
            'athena:GetDatabase',
            'athena:GetQueryResults',
            'athena:GetWorkGroup',
            'athena:GetTableMetadata',
            'athena:StartQueryExecution',
            'athena:GetQueryExecution'
          ],
          resources: [
            glueCatalogArn,
            workGroupArn
          ]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:ListBucket',
            's3:PutObject',
            's3:GetBucketLocation',
            's3:ListBucketMultipartUploads',
            's3:ListMultipartUploadParts',
            's3:AbortMultipartUpload'
          ],
          resources: [
            resultsBucketArn,
            dataBucketArn,
            resultsBucketArn + '/*',
            dataBucketArn + '/*'
          ]
        })
      ]
    })

    this.testingAccessRole = new Role(this, 'testingAccessRole', {
      assumedBy: 
        new CompositePrincipal(
          new ServicePrincipal('beta.awspoirotservice.poirot.aws.internal'),
          new ServicePrincipal('lookoutmetrics.amazonaws.com'),
        ),
      inlinePolicies: {testingAccessRolePolicy}
    });
  }
}
