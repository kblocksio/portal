bring "./workload.w" as w;

new w.Workload(
  image: "hashicorp/http-echo",
  route: "/echo",
  port: 5678,
  env: {
    JUST_VALUE: {
      value: "Hello, world"
    },
    FROM_SECRET: {
      fromSecret: {
        secretName: "my-secret",
        key: "my-key"
      }
    },
    FROM_CONFIG_MAP: {
      fromConfigMap: {
        configMapName: "my-config-map",
        key: "my-key"
      }
    }
  },
  envFrom: [
    { configMapName: "my-config-map", configMapPrefix: "CONFIG_MAP_" },
    { secretName: "my-secret" }
  ]
);
