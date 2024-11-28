const Redis = require("ioredis");
const crypto = require("crypto");
const fs = require("fs");

console.log("KBLOCKS_OBJECT", process.env.KBLOCKS_OBJECT);
console.log("KBLOCKS_OUTPUTS", process.env.KBLOCKS_OUTPUTS);
console.log("KBLOCKS_API_KEY", process.env.KBLOCKS_API_KEY);
console.log("KBLOCKS_PUBSUB_HOST", process.env.KBLOCKS_PUBSUB_HOST);
console.log("KBLOCKS_PUBSUB_PORT", process.env.KBLOCKS_PUBSUB_PORT);

const object = JSON.parse(fs.readFileSync(process.env.KBLOCKS_OBJECT, "utf8"));
const outputs = process.env.KBLOCKS_OUTPUTS;
const adminPassword = process.env.KBLOCKS_API_KEY;
const redisHost = process.env.KBLOCKS_PUBSUB_HOST;
const redisPort = process.env.KBLOCKS_PUBSUB_PORT;

const clusterId = object.metadata.name;

function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

const writeOutputs = (command) => {
  fs.writeFileSync(
    outputs,
    JSON.stringify({
      command,
    }),
  );
};

async function createRedisUser(redis, username, password) {
  // Construct the ACL command to create the user
  const aclCommand = [
    "ACL",
    "SETUSER",
    username,
    "on", // Enable the user
    `>${password}`, // Set the user's password
    "+@all", // Give all permissions (you can restrict these as needed)
  ];
  // Execute the ACL SETUSER command
  return await redis.call(...aclCommand);
}

exports.create = async () => {
  const password = generatePassword();
  // Connect to the Redis server
  const redis = new Redis({
    host: redisHost,
    port: redisPort,
    adminPassword,
  });
  try {
    await createRedisUser(redis, clusterId, password);
    console.log(
      `User '${clusterId}' created successfully with password: ${password}`,
    );
    const command = `kubectl create secret generic redis-credentials --from-literal=password=${password}`;
    writeOutputs(password, command);
  } catch (error) {
    console.error("Error creating cluster:", error);
    writeOutputs("");
  } finally {
    redis.disconnect();
  }
};

exports.deleteUser = async () => {
  const redis = new Redis({
    host: redisHost,
    port: redisPort,
    adminPassword,
  });
  await redis.call("ACL", "DELUSER", clusterId);
  writeOutputs("");
};

exports.update = async () => {
  console.log(`Cluster ${clusterId} updated successfully`);
  writeOutputs("");
};
