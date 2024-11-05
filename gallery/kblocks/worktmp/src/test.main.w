bring "./workload.w" as w;

new w.Worktmp(
  image: "hashicorp/http-echo",
  port: 5678,
  ingress: {
    path: "/echo"
  },
  autoscaling: {
    maxReplicas: 4,
    targetCpuUtilization: 70,
    targetMemoryUtilization: 70
  },
);
