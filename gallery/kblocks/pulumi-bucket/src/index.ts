import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const name = config.get("bucketName");
const isPublic = config.getBoolean("public") ?? false;
const isVersioned = config.getBoolean("versioning") ?? false;
const isEncrypted = config.getBoolean("encrypted") ?? false;
const isProtected = config.getBoolean("protected") ?? false;

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.BucketV2("Bucket", {
  bucket: name,
  forceDestroy: !isProtected,
});

if (isPublic) {
  new aws.s3.BucketPublicAccessBlock("BucketPublicAccessBlock", {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
  });

  new aws.s3.BucketAclV2("BucketAcl", {
    bucket: bucket.id,
    acl: "public-read",
  });
}

if (isVersioned) {
  new aws.s3.BucketVersioningV2("BucketVersioning", {
    bucket: bucket.id,
    versioningConfiguration: {
      status: "Enabled",
    },
  });
}

if (isEncrypted) {
  new aws.s3.BucketServerSideEncryptionConfigurationV2("BucketEncryption", {
    bucket: bucket.id,
    rules: [
      {
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: "AES256",
        },
      },
    ],
  });
}

// Export the name of the bucket
export const bucketName = bucket.id;
export const bucketArn = bucket.arn;
export const consoleUrl = pulumi.interpolate`https://console.aws.amazon.com/s3/bucket/${bucketName}?region=${bucket.region}`;
export const publicUrl = isPublic ? pulumi.interpolate`https://${bucketName}.s3.amazonaws.com` : undefined;