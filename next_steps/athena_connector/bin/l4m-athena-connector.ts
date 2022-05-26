/*
Create the CDK app
*/
import { App } from 'aws-cdk-lib';
import { L4mAthenaStack } from '../lib/root-stack';

const app = new App();
const l4mAthenaStack = new L4mAthenaStack(app, 'l4mAthenaStack');
