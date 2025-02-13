import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";
import * as fs from "fs";

const privateKeyBase64 = process.env.SSH_PRIVATE_KEY_BASE64;
const publicKeyBase64 = process.env.SSH_PUBLIC_KEY_BASE64;

if (!privateKeyBase64 || !publicKeyBase64) {
    throw new Error("SSH_PRIVATE_KEY_BASE64 and SSH_PUBLIC_KEY_BASE64 must be set");
}

const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
const publicKey = Buffer.from(publicKeyBase64, "base64").toString("utf-8");

const role = new aws.iam.Role("Role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "ec2.amazonaws.com",
                },
            },
        ],
    }),
});

new aws.iam.RolePolicyAttachment("RolePolicyAttachment", {
    policyArn: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    role: role.name,
});

const instanceProfile = new aws.iam.InstanceProfile("InstanceProfile", {
    role: role.name,
});

const vpc = new aws.ec2.Vpc("Vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
});

const subnet = new aws.ec2.Subnet("Subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.48.0/20",
    availabilityZone: pulumi.interpolate`${aws.getAvailabilityZones().then(it => it.names[0])}`,
    mapPublicIpOnLaunch: true,
});

const internetGateway = new aws.ec2.InternetGateway("InternetGateway", {
    vpcId: vpc.id,
});

const routeTable = new aws.ec2.RouteTable("RouteTable", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
});

new aws.ec2.RouteTableAssociation("RouteTableAssociation", {
    subnetId: subnet.id,
    routeTableId: routeTable.id,
});

const securityGroup = new aws.ec2.SecurityGroup("SecurityGroup", {
    vpcId: vpc.id,
    egress: [
        {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    ingress: [
        {
            fromPort: 22,
            toPort: 22,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            fromPort: 80,
            toPort: 80,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        },
        {
            fromPort: 11434,
            toPort: 11434,
            protocol: "tcp",
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
});

const ami = aws.ec2
    .getAmi({
        filters: [
            {
                name: "name",
                values: ["amzn2-ami-hvm-2.0.*-x86_64-gp2"],
            },
            {
                name: "architecture",
                values: ["x86_64"],
            },
        ],
        owners: ["137112412989"], // Amazon
        mostRecent: true,
    })
    .then(ami => ami.id);

const keyPair = new aws.ec2.KeyPair("KeyPair", {
    publicKey: publicKey,
});


const instance = new aws.ec2.Instance("Instance", {
    ami,
    keyName: keyPair.keyName,
    instanceType: "g4dn.xlarge",
    rootBlockDevice: {
        volumeSize: 100,
        volumeType: "gp3",
    },
    subnetId: subnet.id,
    vpcSecurityGroupIds: [securityGroup.id],
    iamInstanceProfile: instanceProfile.name,
    userData: fs.readFileSync("cloud-init.yaml", "utf-8"),
    tags: {
        Name: "ollama-server",
    },
});

const connection = {
    host: instance.publicIp,
    user: "ec2-user",
    privateKey,
};

new command.remote.Command("WaitForCloudInit", {
    connection,
    create: "cloud-init status --wait",
});

export const amiId = ami;
export const instanceId = instance.id;
export const publicDns = instance.publicDns
export const publicIp = instance.publicIp;
export const consoleUrl = pulumi.interpolate`https://console.aws.amazon.com/ec2/v2/home?region=${aws.config.region}#InstanceDetails:instanceId=${instance.id}`;
export const chatUrl = pulumi.interpolate`http://${instance.publicIp}`;