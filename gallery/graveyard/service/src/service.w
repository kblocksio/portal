bring util;
bring "@winglibs/k8s" as k8s;
bring "cdk8s-plus-30" as cdk8s;

pub struct File  {
  path: str;
  content: str;
  readonly: bool?;
}

pub struct RepoSpec {
  /// The name of the GitHub repository.
  name: str;

  /// The organization or user that owns the GitHub repository.
  owner: str;

  /// Whether the repository is public or not.
  public: bool?;
}

pub struct ServiceSpec {
  /// The repository to create the service for.
  repo: RepoSpec;

  /// Whether to create a config-only repository (without a Dockerfile).
  configOnly: bool?;
}

pub class Service {
  new(spec: ServiceSpec) {
    let files = MutArray<File>[];
    let var configRepo = false;
    let var revision = "latest";
    if let configOnly = spec.configOnly {
      configRepo = configOnly;
    }

    let image  = "wingcloudbot/{spec.repo.name}";

    if configRepo {
      revision = "main";

      files.push({
        path: "README.md",
        content: "Hello, World!",
        readonly: false,
      });

      files.push({
        path: "Chart.yaml",
        content: [
          "apiVersion: v2",
          "name: {spec.repo.name}",
          "description: Helm chart for {spec.repo.name}",
          "type: application",
          "version: 0.1.0",
          "appVersion: \"0.0.1\"",
        ].join("\n"),
        readonly: false,
      });
      
      files.push({
        path: "./templates/workload.yaml",
        content: "apiVersion: acme.com/v1
kind: Workload
metadata:
  name: workload
image: busybox
port: 5678
\{\{- if or (eq .Values.targetRevision \"latest\") (eq .Values.targetRevision \"main\") }}
route: /{spec.repo.name}(/|$)(.*)
\{\{- else }}
route: /{spec.repo.name}-\{\{ .Values.targetRevision }}(/|$)(.*)
\{\{- end }}
rewrite: /$2
replicas: 2
",
        readonly: false,
      });
    } else {

      files.push({
        path: "README.md",
        content: "Hello, World!",
        readonly: false,
      });
      
      files.push({
        path: "Dockerfile",
        content: [
          "FROM hashicorp/http-echo:latest",
        ].join("\n"),
        readonly: false,
      });
      
      files.push({
        path: "Chart.yaml",
        content: [
          "apiVersion: v2",
          "name: {spec.repo.name}",
          "description: Helm chart for {spec.repo.name}",
          "type: application",
          "version: 0.1.0",
          "appVersion: \"0.0.1\"",
        ].join("\n"),
        readonly: false,
      });
      
      files.push({
        path: "values.yaml",
        content: "revision: latest
targetRevision: latest
",
        readonly: false,
      });
      
      files.push({
        path: "./templates/workload.yaml",
        content: "apiVersion: acme.com/v1
kind: Workload
metadata:
  name: workload
image: \{\{ .Values.image }}:sha-\{\{ .Values.revision }}
port: 5678
\{\{- if or (eq .Values.targetRevision \"latest\") (eq .Values.targetRevision \"main\") }}
route: /{spec.repo.name}(/|$)(.*)
\{\{- else }}
route: /{spec.repo.name}-\{\{ .Values.targetRevision }}(/|$)(.*)
\{\{- end }}
rewrite: /$2
replicas: 2
env:
ECHO_TEXT: \"hello from {spec.repo.name}\"
",
        readonly: false,
      });
      
      files.push({
        path: "./.github/workflows/build.yml",
        content: "name: Build
on:
  push:
    branches:
      - main
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        name: Checkout repository
        with:
          fetch-depth: 0
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: $$\{\{ secrets.DOCKER_USERNAME }}
          password: $$\{\{ secrets.DOCKER_PASSWORD }}
      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: {image}
          tags: |
            type=raw,value=latest,enable=\{\{is_default_branch}}
            type=sha
      - name: Build and push Docker image
        id: push
        uses: docker/build-push-action@v5
        with:
          push: true
          platforms: linux/amd64,linux/arm64
          tags: $$\{\{ steps.meta.outputs.tags }}
          labels: $$\{\{ steps.meta.outputs.labels }}
      - uses: rickstaa/action-create-tag@v1
        with:
          tag: \"latest\"
          force_push_tag: true
          message: \"Latest release\"
",
        readonly: true,
      });
  
      files.push({
        path: "./.github/workflows/pull-request.yml",
        content: "name: Build Pull Request
on:
  pull_request:
    types: [opened, reopened, synchronize]
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        name: Checkout repository
        with:
          fetch-depth: 0
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: $$\{\{ secrets.DOCKER_USERNAME }}
          password: $$\{\{ secrets.DOCKER_PASSWORD }}
      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: {image}
          tags: |
            type=raw,value=latest,enable=\{\{is_default_branch}}
            type=sha
      - name: Build and push Docker image
        id: push
        uses: docker/build-push-action@v5
        with:
          push: true
          platforms: linux/amd64,linux/arm64
          tags: $$\{\{ steps.meta.outputs.tags }}
          labels: $$\{\{ steps.meta.outputs.labels }}
      - uses: rickstaa/action-create-tag@v1
        with:
          tag: \"$$\{\{github.head_ref}}-latest\"
          force_push_tag: true
          message: \"Latest $$\{\{github.head_ref}} release\"
",
        readonly: true,
      });
    }

    new k8s.ApiObject(unsafeCast({
      apiVersion: "acme.com/v1",
      kind: "Repository",
      name: spec.repo.name,
      owner: spec.repo.owner,
      files: files.copy(),
      tags: ["latest"],
    })) as "service-repo";

    let repoURL = "https://github.com/{spec.repo.owner}/{spec.repo.name}.git";
    let params = MutArray<Json>[];

    params.push({
      name: "revision",
      value: "$ARGOCD_APP_REVISION_SHORT",
    }, {
      name: "targetRevision",
      value: "$ARGOCD_APP_SOURCE_TARGET_REVISION",
    });

    if !configRepo {
      params.push({
        name: "image",
        value: image,
      });
    }

    new k8s.ApiObject(
      apiVersion: "argoproj.io/v1alpha1",
      kind: "Application",
      metadata: {
        namespace: "argocd",
        name: spec.repo.name,
      },
      spec: {
        project: "default",
        source: {
          repoURL,
          targetRevision: revision,
          path: "./",
          helm: {
            parameters: params.copy(),
          },
        },
        destination: {
          server: "https://kubernetes.default.svc",
          namespace: spec.repo.name,
        },
        syncPolicy: {
          automated: {
            selfHeal: true,
            prune: true
          },
          syncOptions: [
            "CreateNamespace=true"
          ],
        }
      },
    ) as "argo-application";

    new k8s.ApiObject(
      apiVersion: "argoproj.io/v1alpha1",
      kind: "ApplicationSet",
      metadata: {
        namespace: "argocd",
        name: "{spec.repo.name}-appset",
      },
      spec: {
        goTemplate: true,
        goTemplateOptions: ["missingkey=error"],
        generators: [{
          pullRequest: {
            github: {
              owner: spec.repo.owner,
              repo: spec.repo.name,
              // tokenRef: {
              //   secretName: "github-token",
              //   key: "GITHUB_TOKEN",
              // },
            },
            requeueAfterSeconds: 60,
          },
        }],
        template: {
          metadata: {
            name: "{spec.repo.name}-pr-\{\{.number}}",
          },
          spec: {
            project: "default",
            source: {
              repoURL,
              targetRevision: "\{\{.branch}}-latest",
              path: "./",
              helm: {
                parameters: params.copy(),
              },
            },
            destination: {
              server: "https://kubernetes.default.svc",
              namespace: "{spec.repo.name}-pr-\{\{.number}}",
            },
            syncPolicy: {
              automated: {
                selfHeal: true,
                prune: true
              },
              syncOptions: [
                "CreateNamespace=true"
              ],
            }
          },
        },
      },
    ) as "argo-applicationset";

    new cdk8s.Secret(
      metadata: {
        namespace: "argocd",
        labels: {
          "argocd.argoproj.io/secret-type": "repository",
        }
      },
      stringData: {
        url: repoURL,
        password: util.env("GITHUB_TOKEN"),
        username: "not-used",
      }
    );
  }
} 
