/*
Create the scheduled event that launches the Lambda function.
*/
import { NestedStack, NestedStackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Rule, Schedule, RuleTargetInput } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';

interface L4m2AthenaSchedLambdaEventStackProps extends NestedStackProps {
  lambdaFunction: Function,
  eventRuleFrequency: number,
  enabled: boolean,
  dataBucketName: string,
  bucketPrefix: string,
  databaseName: string,
  tableName: string,
  workGroupName: string,
  detectorFrequency: string,
  historicalDataPoints: string,
  futureDataPoints: string,
}

export class L4m2AthenaSchedLambdaEventStack extends NestedStack {
  constructor(scope: Construct, id: string, props: L4m2AthenaSchedLambdaEventStackProps) {
    super(scope, id, props);

    const {
      lambdaFunction,
      eventRuleFrequency, 
      enabled,
      dataBucketName,
      bucketPrefix,
      databaseName,
      tableName,
      workGroupName,
      detectorFrequency,
      historicalDataPoints,
      futureDataPoints
    } = props;

    // Create the event rule to run on a schedule. Note that scheduled rules can 
    // only run on the default event bus.
    const l4mSchedEventRule = new Rule(this, 'l4mSchedEventRule', {
      enabled: enabled,
      description: "AthenaDataGenerator-5M event rule",
      schedule: Schedule.rate(Duration.minutes(eventRuleFrequency))
    });

    l4mSchedEventRule.addTarget(new LambdaFunction(lambdaFunction, {
      event: RuleTargetInput.fromObject({
        adFrequencyInSeconds: detectorFrequency,
        bucketName: dataBucketName,
        bucketPrefix: bucketPrefix,
        database: databaseName,
        numberOfHistoricalDataPoints: historicalDataPoints,
        numberOfFutureDataPoints: futureDataPoints,
        tableName: tableName,
        workgroup: workGroupName
      })
    }));
  }
}
