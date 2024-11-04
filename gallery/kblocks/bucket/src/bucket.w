bring cloud;
bring aws;
bring "cdktf" as cdktf;

pub struct BucketSpec {
  region: str?;
  public: bool?;
  forceDestroy: bool?;
}

pub class Bucket {
  pub bucketArn: str;

  new(spec: BucketSpec) {
    let b = new cloud.Bucket(public: spec.public, forceDestroy: spec.forceDestroy);
    if let b = aws.Bucket.from(b) {
      this.bucketArn = b.bucketArn;

      new cdktf.TerraformOutput(value: b.bucketArn, staticId: true) as "bucketArn";
      new cdktf.TerraformOutput(value: b.bucketName, staticId: true) as "bucketName";
      new cdktf.TerraformOutput(value: b.bucketDomainName, staticId: true) as "bucketDomainName";
    }
  }
}