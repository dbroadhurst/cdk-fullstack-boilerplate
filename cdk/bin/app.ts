#!/usr/bin/env node

import 'dotenv/config'
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AppStack } from '../lib/app-stack'
import { exit } from 'process'

const app = new cdk.App()

const valid = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_DEFAULT_REGION',
  'AWS_CERT_ARN',
  'CDK_DEFAULT_ACCOUNT',
  'CDK_DEFAULT_REGION',
  'BUILD_ENV',
  'DOMAIN_NAME',
].forEach((env: string) => {
  if (!process.env[env]) {
    console.log(`${env}=${process.env[env]} not found`)
    exit(1)
  }
  console.log(`${env}=${process.env[env]}`)
})

// https://docs.aws.amazon.com/cdk/latest/guide/environments.html
let account = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
}

const buildEnv = process.env.BUILD_ENV

new AppStack(app, `cdkfullstack-${buildEnv}-Stack`, {
  ...account,
  // @ts-ignore
  domainName: process.env.DOMAIN_NAME,
  // @ts-ignore
  buildEnv: buildEnv,
})
