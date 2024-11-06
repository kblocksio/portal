import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MarkdownWrapper } from "../markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";

const engines = [
  {
    name: "Terraform",
    description:
      "Terraform is an open-source infrastructure as code software tool that provides a consistent CLI workflow to manage hundreds of cloud providers.",
    src: "/terraform.svg",
  },
  {
    name: "CloudFormation",
    description:
      "CloudFormation is a service that enables you to model and set up your Amazon Web Services resources so that they can be provisioned and managed efficiently.",
    src: "/cloudformation.svg",
  },
  {
    name: "Pulumi",
    description:
      "Pulumi is an open-source infrastructure as code software tool that enables you to preview, deploy, and manage infrastructure on any cloud using your favorite language.",
    src: "/pulumi.svg",
  },
  {
    name: "AWS CDK",
    description:
      "AWS Cloud Development Kit (AWS CDK) is an open-source software development framework that enables you to define cloud infrastructure in code and provision it through AWS CloudFormation.",
    src: "/awscdk.svg",
  },
  {
    name: "Helm",
    description:
      "Helm is an open-source package manager for Kubernetes that allows you to define, install, and upgrade even the most complex Kubernetes applications.",
    src: "/helm.svg",
  },
  {
    name: "OpenTofu",
    description:
      "OpenTofu is an open-source infrastructure as code software tool that enables you to manage your infrastructure as code.",
    src: "/tofu.svg",
  },
  {
    name: "Winglang",
    description:
      "Winglang is an open-source programming language that enables you to build cloud applications.",
    src: "/wing.svg",
  },
];

function Logo() {
  return (
    <a className="flex items-center space-x-2" href="/">
      <img
        src="/wing.svg"
        alt="Wing Logo"
        className="h-6 w-6"
        width={24}
        height={24}
      />
    </a>
  );
}

export interface ResourceTypeWizardProps {
  isOpen: boolean;
  handleOnOpenChange: (isOpen: boolean) => void;
}

export const ResourceTypeWizard = ({
  isOpen,
  handleOnOpenChange,
}: ResourceTypeWizardProps) => {
  const [step, setStep] = useState(1);

  const [kind, setKind] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [plural, setPlural] = useState<string>("");
  const [selectedEngine, setSelectedEngine] = useState<string>("");
  const [version, setVersion] = useState<string>("v1");
  const [directory, setDirectory] = useState<string>("my-kblock");
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setStep(1);
        setKind("");
        setGroup("");
        setPlural("");
        setVersion("");
        setDirectory("");
      }
      handleOnOpenChange(open);
    },
    [handleOnOpenChange],
  );

  const codeSnippet = useMemo(() => {
    return `\`\`\`bash
      kb init --engine ${selectedEngine.toLowerCase()} --group ${group.toLowerCase()} --kind ${kind.toLowerCase()} --plural ${plural.toLowerCase()} --version ${version} ./${directory}`;
  }, [kind, group, plural, version, selectedEngine, directory]);

  const enginesCards = useMemo(() => {
    return (
      <div className="grid grid-cols-3 gap-4 overflow-auto">
        {engines.map((engine, index) => {
          return (
            <Card
              key={index}
              className={cn(
                "hover:bg-accent flex max-h-[240px] cursor-pointer flex-col justify-center",
                engine.name === selectedEngine && "bg-accent",
              )}
              onClick={() => setSelectedEngine(engine.name)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedEngine(engine.name);
                }
              }}
            >
              <CardHeader className="flex h-[75px] flex-row items-center border-b border-b-gray-200 text-center align-middle">
                <div className="flex w-full items-center self-center">
                  <img
                    src={engine.src}
                    alt={engine.name}
                    className="h-10 w-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-start flex min-h-[165px] flex-col p-4">
                <CardTitle className="mb-2">{engine.name}</CardTitle>
                <CardDescription>{engine.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }, [selectedEngine]);

  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  const handleGenerate = useCallback(() => {
    if (
      !selectedEngine ||
      !group ||
      !kind ||
      !plural ||
      !version ||
      !directory
    ) {
      return;
    }
    setStep(2);
  }, [selectedEngine, group, kind, plural, version, directory]);

  const handleDone = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[90vh] min-w-[90vh] flex-col"
        aria-describedby="Create a new Kblock"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {step === 1 && <Logo />}
              {step === 2 && (
                <img
                  src={
                    engines.find((engine) => engine.name === selectedEngine)
                      ?.src
                  }
                  alt={selectedEngine}
                  className="h-10 w-10"
                />
              )}
              Create a New {step === 2 && selectedEngine} Kblock
            </div>
            <DialogDescription>
              Create a new {step === 2 && selectedEngine} Kblock
            </DialogDescription>
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex h-full flex-col space-y-4 overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
        >
          <div className="flex overflow-auto">
            <div className="ml-2 mr-2 space-y-4 border-b pb-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">
                    Group
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    disabled={step !== 1}
                    required
                    id="group"
                    placeholder="Group"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kind">
                    Kind
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    disabled={step !== 1}
                    required
                    id="kind"
                    placeholder="Kind"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plural">
                    Plural
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    disabled={step !== 1}
                    required
                    id="plural"
                    placeholder="Plural"
                    value={plural}
                    onChange={(e) => setPlural(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">
                    Version
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    disabled={step !== 1}
                    required
                    id="version"
                    placeholder="Version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="directory">
                    Directory
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    disabled={step !== 1}
                    required
                    id="directory"
                    placeholder="Directory"
                    value={directory}
                    onChange={(e) => setDirectory(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {step === 1 && enginesCards}
            {step === 2 && (
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <CardTitle>
                    Copy and paste the following command into your terminal:
                  </CardTitle>
                  <MarkdownWrapper content={codeSnippet} />
                </div>
                <div className="text-sm">
                  For more information and examples visit{" "}
                  <a
                    className="text-blue-500 underline"
                    href="https://github.com/winglang/kblocks-gallery"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kblocks Gallery
                  </a>
                </div>
              </div>
            )}
          </div>
          {step === 1 && (
            <DialogFooter>
              <Button type="submit">Generate...</Button>
            </DialogFooter>
          )}
          {step === 2 && (
            <DialogFooter>
              <Button type="button" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
