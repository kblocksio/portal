bring "cdk8s-plus-30" as k8s;
bring "cdk8s" as cdk8s;
bring "./shared.w" as api;

pub struct WorkloadSpec extends api.ContainerSpec, api.PolicySpec {
  /// The number of replicas to create for this container
  replicas: num?;

  /// Ingress path for this workload. If specified, this workload will be exposed publicly.
  /// @deprecated use `public.path` instead
  route: str?;

  /// Rewrite host header on backend 
  /// @deprecated use `public.rewrite` instead
  rewrite: str?;

  /// Make this workload publicly accessible
  ingress: Ingress?;
}

pub struct Ingress {
  /// Ingress path for this workload.
  path: str;

  /// Hostname to use for this endpoint
  host: str?;

  /// Rewrite host header on backend 
  rewrite: str?;

  /// TLS certificate to use for this endpoint
  tls: Certificate?;
}

pub struct Certificate {
  /// Secret name containing the TLS certificate and key to use for this workload
  /// 
  /// To install, use:
  /// ```
  /// kubectl create secret tls my-tls-secret \
  ///   --cert=/path/to/tls.crt \
  ///   --key=/path/to/tls.key
  /// ```
  ///
  /// Then specify the secret name here.
  secret: str;

  /// Hostnames to use for this certificate
  hosts: Array<str>;
}

pub class Workload {
  pub host: str?;
  pub port: str?;

  new(spec: WorkloadSpec) {

    let d = new k8s.Deployment(
      replicas: spec.replicas ?? 1,
      automountServiceAccountToken: true,
      serviceAccount: api.newServiceAccount(spec),
    );

    d.addContainer(api.newContainer(spec));

    if let port = spec.port {
      let service = d.exposeViaService(ports: [{ port }]);
      this.host = service.name;
      this.port = "{service.port}";

      let var route = spec.ingress?.path;
      if let r = spec.route { route = r; }

      let var rewrite = spec.ingress?.rewrite;
      if let r = spec.rewrite { rewrite = r; }

      if let route = route {
        let tlsConfig = MutArray<k8s.IngressTls>[];

        if let certificate = spec.ingress?.tls {
          tlsConfig.push({ 
            secret: k8s.Secret.fromSecretName(this, "tls-secret", certificate.secret),
            hosts: certificate.hosts
          });
        }

        let ingress = new k8s.Ingress(
          tls: tlsConfig.copy(),
        );

        if let host = spec.ingress?.host {
          ingress.addHostRule(host, route, k8s.IngressBackend.fromService(service), k8s.HttpIngressPathType.PREFIX);
        } else {
          ingress.addRule(route, k8s.IngressBackend.fromService(service), k8s.HttpIngressPathType.PREFIX);
        }

        if let rewrite = rewrite {
          ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/rewrite-target", rewrite);
        }

        // allow large request headers
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-buffer-size", "128k");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-buffers-number", "4");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-busy-buffers-size", "256k");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/large-client-header-buffers", "4 32k");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-read-timeout", "36000");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-send-timeout", "36000");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/proxy-connect-timeout", "36000");
        ingress.metadata.addAnnotation("nginx.ingress.kubernetes.io/enable-websocket", "true");
      }
    } else {
      if spec.route != nil {
        throw "Cannot specify 'path' without 'port'";
      }
    }
  }
}
