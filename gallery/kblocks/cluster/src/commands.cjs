const crypto = require("crypto");
const fs = require("fs");

const COMMAND_TEMPLATE = `
\`\`\`sh
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: kblocks
---
apiVersion: v1
kind: Secret
metadata:
  namespace: kblocks
  name: kblocks
stringData:
  KBLOCKS_PUBSUB_HOST: __KBLOCKS_PUBSUB_HOST__
  KBLOCKS_PUBSUB_PORT: "__KBLOCKS_PUBSUB_PORT__"
  KBLOCKS_API_KEY: __KBLOCKS_API_KEY__
  KBLOCKS_SYSTEM_ID: __KBLOCKS_SYSTEM_ID__
  KBLOCKS_STORAGE_PREFIX: __KBLOCKS_STORAGE_PREFIX__
EOF
\`\`\`
`;

function fillTemplate(template, variables) {
  return template.replace(/__(.*?)__/g, (_, key) => {
    return variables[key] || "";
  });
}

// console.log("KBLOCKS_OBJECT", process.env.KBLOCKS_OBJECT);
// console.log("KBLOCKS_OUTPUTS", process.env.KBLOCKS_OUTPUTS);
// console.log("KBLOCKS_API_KEY", process.env.KBLOCKS_API_KEY);
// console.log("KBLOCKS_PUBSUB_HOST", process.env.KBLOCKS_PUBSUB_HOST);
// console.log("KBLOCKS_PUBSUB_PORT", process.env.KBLOCKS_PUBSUB_PORT);

const object = JSON.parse(fs.readFileSync(process.env.KBLOCKS_OBJECT, "utf8"));
const outputs = process.env.KBLOCKS_OUTPUTS;
const adminPassword = process.env.KBLOCKS_API_KEY;
const redisHost = process.env.KBLOCKS_PUBSUB_HOST;
const redisPort = process.env.KBLOCKS_PUBSUB_PORT;

const clusterId = object.metadata.name;

// function generatePassword(length = 16) {
//   return crypto.randomBytes(length).toString("base64").slice(0, length);
// }

const writeOutputs = (command) => {
  fs.writeFileSync(
    outputs,
    JSON.stringify({
      command,
    }),
  );
};

// async function createRedisUser(redis, username, password) {
//   // Construct the ACL command to create the user
//   const aclCommand = [
//     "ACL",
//     "SETUSER",
//     username,
//     "on", // Enable the user
//     `>${password}`, // Set the user's password
//     "+@all", // Give all permissions (you can restrict these as needed)
//   ];
//   // Execute the ACL SETUSER command
//   return await redis.call(...aclCommand);
// }

exports.create = async () => {
  // const password = generatePassword();
  // Connect to the Redis server
  // console.log("Connecting to Redis server");
  // console.log("redisHost", redisHost);
  // console.log("redisPort", redisPort);
  // console.log("adminPassword", adminPassword);
  // const redis = new Redis({
  //   host: redisHost,
  //   port: redisPort,
  //   password: adminPassword,
  //   username: "admin",
  // });
  // try {
  //   await createRedisUser(redis, clusterId, password);
  //   console.log(
  //     `User '${clusterId}' created successfully with password: ${password}`,
  //   );
  const command = fillTemplate(COMMAND_TEMPLATE, {
    // KBLOCKS_API_KEY: password,
    KBLOCKS_API_KEY: adminPassword,
    KBLOCKS_PUBSUB_HOST: redisHost,
    KBLOCKS_PUBSUB_PORT: redisPort,
    KBLOCKS_SYSTEM_ID: clusterId,
    KBLOCKS_STORAGE_PREFIX: clusterId,
  });
  console.log(`Creating cluster ${clusterId}`);
  console.log("command", command);
  writeOutputs(command);
  // } catch (error) {
  //   console.error("Error creating cluster:", error);
  //   writeOutputs("");
  //   throw error;
  // } finally {
  //   redis.disconnect();
  // }
};

exports.deleteUser = async () => {
  // const redis = new Redis({
  //   host: redisHost,
  //   port: redisPort,
  //   password: adminPassword,
  //   username: "admin",
  // });
  // await redis.call("ACL", "DELUSER", clusterId);
  // writeOutputs("");
  console.log(`Cluster ${clusterId} deleted successfully`);
};

exports.update = async () => {
  console.log(`Cluster ${clusterId} updated successfully`);
};
