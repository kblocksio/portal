export type Category = {
  title: string;
  description: string;
  icon: string;
  color: string;
  docslink: string;
};

export const categories: Record<string, Category> = {
  workloads: {
    title: "Workloads",
    description:
      "Workloads represent the tasks or applications running within your environments.",
    icon: "heroicon://rectangle-stack",
    color: "slate",
    docslink: "https://docs.kblocks.io/categories/workloads",
  },
  databases: {
    title: "Databases",
    description:
      "The 'Databases' category provides platform teams and developers with essential tools to manage various types of databases, from relational databases like PostgreSQL to NoSQL solutions like MongoDB.",
    icon: "heroicon://database",
    color: "green",
    docslink: "https://docs.kblocks.io/categories/databases",
  },
  environments: {
    title: "Environments",
    description:
      "Environments are a critical aspect of software development and deployment. They represent isolated spaces where developers can build, test, and deploy their applications without interference.",
    icon: "heroicon://server",
    color: "slate",
    docslink: "https://docs.kblocks.io/categories/environments",
  },
  cloud: {
    title: "Cloud",
    description:
      "The 'Cloud' category provides developers with the building blocks to manage and provision cloud resources, enabling them to leverage the full potential of cloud platforms.",
    icon: "heroicon://cloud",
    color: "blue",
    docslink: "https://docs.kblocks.io/categories/cloud",
  },
  cicd: {
    title: "CI/CD",
    description:
      "Continuous Integration and Continuous Delivery (CI/CD) is a set of practices that enable rapid and reliable software development by automating the integration of code changes and their delivery to production environments.",
    icon: "heroicon://code-bracket",
    color: "amber",
    docslink: "https://docs.kblocks.io/categories/cicd",
  },
  demo: {
    title: "Demo",
    description:
      "Demo is a category for showcasing Kblocks in action. It includes examples of how to use Kblocks to build various types of applications.",
    icon: "heroicon://presentation-chart-line",
    color: "red",
    docslink: "https://docs.kblocks.io/categories/demo",
  },
};
