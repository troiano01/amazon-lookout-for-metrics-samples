/*
Create the Athena WorkGroup
*/
import { NestedStack, NestedStackProps, ScopedAws } from 'aws-cdk-lib';
import { CfnWorkGroup } from 'aws-cdk-lib/aws-athena';
import { Construct } from 'constructs';
import { PolicyDocument, PolicyStatement, AccountRootPrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';

interface WorkGroupStackProps extends NestedStackProps {
  workGroupName: string;
  outputLocation: string;
}

export class WorkGroupStack extends NestedStack {
  public readonly workGroupKeyArn: string;
  public readonly workGroupArn: string;
  constructor(scope: Construct, id: string, props: WorkGroupStackProps) {
    super(scope, id, props);

    const {workGroupName, outputLocation} = props;
    const {accountId, region} = new ScopedAws(this);

    const workgroupKeyPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        actions: ['kms:*'],
        principals: [new AccountRootPrincipal()],
        resources: ['*']
      })]
    });

    const workGroupKey = new Key(this, 'workgroupKey', {
      enableKeyRotation: true,
      policy: workgroupKeyPolicy
    });

    const cfnWorkGroup = new CfnWorkGroup(this, 'MyCfnWorkGroup', {
      name: workGroupName,
      recursiveDeleteOption: true,
      workGroupConfiguration: {
        enforceWorkGroupConfiguration: false, //Required to be false for Athena Connector
        resultConfiguration: {
          outputLocation: outputLocation,
          encryptionConfiguration: {
            encryptionOption: 'SSE_KMS',
            kmsKey: workGroupKey.keyArn
          }
        }
      }
    });

    // Version of the athena constructs do not yet make the ARN available.
    this.workGroupArn = 'arn:aws:athena:' + region + ':' + accountId + ':workgroup/' + workGroupName;
    this.workGroupKeyArn = workGroupKey.keyArn;
  }
}
