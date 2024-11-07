import { CircleIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const EngineLabel = ({ engine }: { engine: string }) => {
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <EngineIcon engine={engine} className="h-8 w-8" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-x-2">
              Engine:
              <span className="font-medium">{engine}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const EngineIcon = ({
  engine,
  className,
}: {
  engine: string;
  className?: string;
}) => {
  switch (engine) {
    case "tofu":
      return (
        <div className="flex items-center">
          <img src="/images/tofu.svg" alt="Tofu" className={className} />
        </div>
      );

    case "wing/tf-aws":
      return (
        <div className="flex items-center">
          <img src="/images/terraform.svg" alt="Terraform" className={className} />
          <img src="/images/aws.svg" alt="AWS" className={className} />
          <img src="/images/wing.svg" alt="Tofu" className={className} />
        </div>
      );

    case "helm":
      return (
        <div className="flex items-center">
          <img src="/images/helm.svg" alt="Helm" className={className} />
        </div>
      );

    case "wing":
      return (
        <div className="flex items-center">
          <img src="/images/wing.svg" alt="Wing" className={className} />
        </div>
      );

    case "custom":
      return (
        <div className="flex items-center">
          <img src="/images/shell.svg" alt="Custom" className={className} />
        </div>
      );

    case "pulumi":
      return (
        <div className="flex items-center">
          <img src="/images/pulumi.svg" alt="Pulumi" className={className} />
        </div>
      );

    case "cloudformation":
      return (
        <div className="flex items-center">
          <img
            src="/images/cloudformation.svg"
            alt="CloudFormation"
            className={className}
          />
        </div>
      );

    case "awscdk":
      return (
        <div className="flex items-center">
          <img src="/images/awscdk.svg" alt="AWS CDK" className={className} />
        </div>
      );

    default:
      return <CircleIcon className={className} />;
  }
};
