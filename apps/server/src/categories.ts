export type Category = {
  title: string;
  description: string;
  icon: string;
  color: string;
  docslink: string;
}

export const categories: Record<string, Category> = {
  "environments": {
    "title": "Environments",
    "description": "Environments are a critical aspect of software development and deployment. They represent isolated spaces where developers can build, test, and deploy their applications without interference. Environments can range from local development environments to fully-fledged production setups, each tailored to meet the specific needs of different stages in the software lifecycle. Managing environments helps platform teams ensure consistency, security, and scalability, providing developers with a reliable space to experiment and deliver their code. This category offers a variety of tools to configure and manage these environments efficiently, ensuring smoother workflows and minimizing potential disruptions across teams.",
    "icon": "heroicon://server",
    "color": "slate",
    "docslink": "https://docs.kblocks.io/categories/environments"
  },
  "cicd": {
    "title": "CI/CD",
    "description": "Continuous Integration and Continuous Delivery (CI/CD) is a set of practices that enable rapid and reliable software development by automating the integration of code changes and their delivery to production environments. With CI/CD, developers can commit code more frequently, ensuring that new features and bug fixes are integrated seamlessly into the main branch without breaking the build. This reduces manual intervention, speeds up the release cycle, and ensures consistent quality across deployments. The CI/CD building blocks provided in this category allow platform teams to create automated pipelines that enhance developer productivity while maintaining code quality and system stability.",
    "icon": "heroicon://code-bracket",
    "color": "amber",
    "docslink": "https://docs.kblocks.io/categories/cicd"
  },
  "cloud": {
    "title": "Cloud",
    "description": "Cloud resources have become the backbone of modern applications, offering scalability, flexibility, and cost-efficiency that are essential in today's fast-paced development cycles. Managing cloud infrastructure involves orchestrating various services such as storage, compute, and networking to build robust, scalable applications. The 'Cloud' category provides developers with the building blocks to manage and provision cloud resources, enabling them to leverage the full potential of cloud platforms. Whether it's setting up virtual machines, deploying containers, or integrating with cloud-native services, these tools simplify cloud management while ensuring adherence to best practices and compliance requirements.",
    "icon": "heroicon://cloud",
    "color": "blue",
    "docslink": "https://docs.kblocks.io/categories/cloud"
  },
  "workloads": {
    "title": "Workloads",
    "description": "Workloads represent the tasks or applications running within your environments. Effectively managing workloads is crucial for maintaining performance, security, and scalability across different stages of development. This category focuses on tools that enable platform teams to deploy, monitor, and optimize these workloads, whether they're running on virtual machines, containers, or serverless architectures. By managing workloads efficiently, developers can focus on building features while the platform ensures their applications perform optimally, scale seamlessly, and remain secure under varying conditions.",
    "icon": "heroicon://rectangle-stack",
    "color": "slate",
    "docslink": "https://docs.kblocks.io/categories/workloads"
  },
  "databases": {
    "title": "Databases",
    "description": "Databases are fundamental to storing and managing data for applications, and their performance and reliability directly impact the success of an organization’s software. The 'Databases' category provides platform teams and developers with essential tools to manage various types of databases, from relational databases like PostgreSQL to NoSQL solutions like MongoDB. These blocks assist in tasks such as provisioning, scaling, monitoring, and securing database resources, ensuring that data is accessible, reliable, and secure. By leveraging these tools, developers can focus on building data-driven applications while the platform takes care of the operational complexities.",
    "icon": "heroicon://database",
    "color": "green",
    "docslink": "https://docs.kblocks.io/categories/databases"
  }
};