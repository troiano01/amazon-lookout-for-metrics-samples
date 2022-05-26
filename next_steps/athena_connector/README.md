# Amazon Lookout for Metrics, Athena Connector Resources
Installs the required resources for the blog post, TBD.

<!--BEGIN STABILITY BANNER-->
---
![Stability: Stable](https://img.shields.io/badge/stability-Stable-success.svg?style=for-the-badge)

> **This is a stable example. It should successfully build out of the box**
>
> This example is built on Construct Libraries marked "Stable" and does not have any infrastructure prerequisites to build.
>
---
<!--END STABILITY BANNER-->

This example creates an Athena environment with glue table and database with a lambda data generator to demonstrate the Lookout for Metrics Athena Connector functionality. This example repository presents these resources as CDK constructs so they can easily be adapted to any environment. While the focus here is for flexibility, if you would like to setup the resources quickly, you can deploy the CloudFormation script linked on the blog or deploy [the one located here](./generated-cfn/l4mAthena-distro), generated by the AWS CDK synth process.

---

## Prerequisites
The instructions below assume familiarity with AWS CDK. If you need to start with setting that up, you can start with [the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) and [the AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) documentation. The instructions reference using named profiles. If you use more than one AWS environment, it is recommended to [setup named profiles on your system](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html).

## Clone the repository

To build this app, you need to be in this example's root folder. Then run the following:

```bash
$ mkdir <project directory>
$ cd <project directory>
$ git clone https://github.com/troiano01/l4m_athena_connector.git
```

## Build

To build this app, you need to be in this example's root folder. Then run the following:

```bash
$ npm install aws-cdk-lib
$ cdk bootstrap --profile <aws credentials profile>
$ cdk synth --profile <aws credentials profile> --all
```

This will install the necessary CDK, then this example's dependencies, and then build your TypeScript files and your CloudFormation template.

## Deploy

This will deploy/redeploy your stacks to your AWS Account.

```bash
$ cdk deploy --profile <aws credentials profile> --all
```

## Create the Amazon Lookout for Metrics Detector and Data Source

Refer to blog for next steps...


## Cleanup

Once completed with the walkthrough steps, this will destroy/remove your stacks from your AWS Account.
1. Manually delete the L4M detector you created in the above steps.
2. Once it is fully deleted (takes a few minutes), remove the supporting AWS resources using the 'CDK destroy' command.
```bash
$ cdk destroy --profile <aws credentials profile> --all
```

---