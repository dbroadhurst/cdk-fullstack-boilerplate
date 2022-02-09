import {
  aws_certificatemanager as acm,
  aws_ec2 as ec2,
  aws_ecr_assets,
  aws_ecs as ecs,
  aws_ecs_patterns as ecs_patterns,
  aws_elasticloadbalancingv2 as elbv2,
  aws_rds as rds,
  aws_route53 as route53,
  aws_secretsmanager as secretsManager,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'

export interface AppStackProps extends StackProps {
  domainName: string
  buildEnv: string
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props)

    const { domainName, buildEnv } = props

    const getResourceName = (id: string) => `${buildEnv}-${id}`

    // Dont prefix buildEnv for prod builds
    const getUrl = (service: string) => `${service}.${domainName}`

    const vpc = new ec2.Vpc(this, getResourceName('vpc'), {
      maxAzs: 2,
    })

    const cluster = new ecs.Cluster(this, getResourceName('cluster'), {
      vpc: vpc,
    })

    // Todo, use env var and check
    // @ts-ignore
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', process.env.AWS_CERT_ARN)

    const hostedZone = route53.HostedZone.fromLookup(this, getResourceName('hosted-zone'), {
      domainName: domainName,
    })

    // -----------------------------------------------------
    // Create a postgres db password

    const databaseCredentialsSecret = new secretsManager.Secret(this, getResourceName('database-password'), {
      secretName: getResourceName('database-password-credentials'),
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    })

    const dbInstance = new rds.DatabaseInstance(this, getResourceName('database'), {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_3,
      }),
      credentials: rds.Credentials.fromSecret(databaseCredentialsSecret),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      databaseName: 'cdkfullstack',
      publiclyAccessible: false,
      // autoMinorVersionUpgrade: false
    })

    // -----------------------------------------------------
    // Create a load-balanced Web service and make it public

    const webImage = new aws_ecr_assets.DockerImageAsset(this, getResourceName('web-image'), {
      directory: path.join(__dirname, '../../app'),
      buildArgs: {
        NODE_ENV: 'production',
        REACT_APP_API: `https://${getUrl(`${buildEnv}-api`)}`,
        REACT_APP_GIT_SHA: `${process.env.REACT_APP_GIT_SHA}`,
        REACT_APP_BUILD_DATE: `${process.env.REACT_APP_BUILD_DATE}`,
      },
    })

    const webService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, getResourceName('web-service'), {
      cluster: cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(webImage),
      },
      publicLoadBalancer: true,
      domainName: getUrl(buildEnv),
      domainZone: hostedZone,
      protocol: elbv2.ApplicationProtocol.HTTPS,
    })
    webService.listener.addCertificates(getResourceName('web-cert'), [certificate])
    webService.targetGroup.configureHealthCheck({
      port: '80',
      path: '/',
      timeout: Duration.seconds(20),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 10,
      interval: Duration.seconds(30),
    })

    // -----------------------------------------------------
    // Create a load-balanced API service and make it public

    const apiImage = new aws_ecr_assets.DockerImageAsset(this, getResourceName('api-image'), {
      directory: path.join(__dirname, '../../api'),
      buildArgs: {},
    })

    const apiService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, getResourceName('api-service'), {
      cluster: cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(apiImage),
        containerPort: 8000,
        secrets: {
          DB_INFO: ecs.Secret.fromSecretsManager(databaseCredentialsSecret),
        },
        environment: {
          NODE_ENV: 'production',
          PORT: '8000',
          AWS_ACCESS_KEY_ID: `${process.env.AWS_ACCESS_KEY_ID}`,
          AWS_SECRET_ACCESS_KEY: `${process.env.AWS_SECRET_ACCESS_KEY}`,
          AWS_REGION: `${process.env.AWS_DEFAULT_REGION}`,
          DB_USER: 'cdkfullstack',
          DB_HOST: dbInstance.dbInstanceEndpointAddress,
        },
      },
      publicLoadBalancer: true,
      domainName: getUrl(`${buildEnv}-api`),
      domainZone: hostedZone,
      protocol: elbv2.ApplicationProtocol.HTTPS,
    })
    apiService.listener.addCertificates(getResourceName('api-cert'), [certificate])
    apiService.targetGroup.configureHealthCheck({
      port: '8000',
      path: '/health',
      timeout: Duration.seconds(20),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 10,
      interval: Duration.seconds(30),
    })
    apiService.targetGroup.enableCookieStickiness(Duration.seconds(24 * 60 * 60))
    dbInstance.connections.allowDefaultPortFrom(apiService.service, getResourceName('from-api'))
  }
}
