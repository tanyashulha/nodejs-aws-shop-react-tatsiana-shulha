import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

const CART_API_EB_HOST =
  'tanyashulha-cart-api-develop.eu-central-1.elasticbeanstalk.com';

export class CartApiProxyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const distribution = new cloudfront.Distribution(this, 'CartApiDistribution', {
      comment: 'HTTPS proxy for Cart Service on Elastic Beanstalk',
      defaultBehavior: {
        origin: new origins.HttpOrigin(CART_API_EB_HOST, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        responseHeadersPolicy:
          cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
    });

    new cdk.CfnOutput(this, 'CartApiCloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Use as cart API base URL in apiPaths.ts (append /api)',
    });
  }
}
