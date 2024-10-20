import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { FieldRenderer } from "./field-renderer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ApiObject } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";

export interface FormGeneratorProps {
  schema: any;
  isLoading: boolean;
  handleBack: () => void;
  handleSubmit: (meta: ObjectMetadata, fields: any) => void;
  initialValues?: ApiObject;
  initialMeta: Partial<ObjectMetadata>;
}

export const FormGenerator = ({
  schema,
  isLoading,
  handleBack,
  handleSubmit,
  initialValues,
  initialMeta,
}: FormGeneratorProps) => {
  const [formData, setFormData] = useState<any>(initialValues || {});
  const [system] = useState<string>(initialMeta?.system ?? "demo");
  const [namespace, setNamespace] = useState<string>(
    initialMeta?.namespace ?? "default",
  );
  const [name, setName] = useState<string>(initialMeta?.name ?? "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus on the name input when it's empty
  useEffect(() => {
    if (name.length === 0 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [name]);

  const metadataObject: ObjectMetadata = useMemo(
    () => ({
      name,
      namespace,
      system,
    }),
    [name, namespace, system],
  );

  return (
    <form
      className="flex h-full flex-col space-y-4 overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        const meta: ObjectMetadata = metadataObject;
        handleSubmit(meta, formData);
      }}
    >
      <div className="ml-2 mr-2 space-y-4 border-b pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Name
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder="Resource name"
              disabled={!!initialValues}
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameInputRef}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="namespace"
              className={`${initialValues ? "opacity-50" : ""}`}
            >
              Namespace
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="namespace"
              placeholder="Namespace"
              disabled={!!initialValues}
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="system" className={"opacity-50"}>
              System
            </Label>
            <Input
              required
              id="system"
              placeholder="System"
              disabled={true}
              value={system}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 overflow-y-auto pb-4 pr-4">
          <FieldRenderer
            objectMetadata={metadataObject}
            schema={cronJob}
            fieldName=""
            path=""
            formData={formData}
            updateFormData={setFormData}
            hideField={true}
          />
        </div>
      </div>
      <div className="flex justify-between border-t border-gray-200 pt-4">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialValues ? "Updating..." : "Creating..."}
            </>
          ) : initialValues ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  );
};


const cronJob = {
  "type": "object",
  "required": [
      "schedule",
      "image"
  ],
  "properties": {
      "image": {
          "description": "The Docker image or GitHub repository to use for the cron job.\n@ui kblocks.io/one-of\n@order 1",
          "type": "object",
          "properties": {
              "fromImage": {
                  "type": "object",
                  "required": [
                      "image"
                  ],
                  "properties": {
                      "image": {
                          "type": "string",
                          "description": "The image to use for the service\n@order 1"
                      },
                      "advanced": {
                          "type": "object",
                          "description": "Advanced configuration options\n@order 2",
                          "properties": {
                              "secretFiles": {
                                  "type": "array",
                                  "items": {
                                      "type": "string"
                                  },
                                  "description": "Store plaintext files containing secret data (such as a .env file or a private key). Access during builds and at runtime from your app's root, or from /etc/secrets/<filename>.\n@order 1"
                              },
                              "dockerCommand": {
                                  "type": "string",
                                  "description": "Optionally override your Dockerfile's CMD and ENTRYPOINT instructions with a different command to start your service.\n@order 2"
                              },
                              "preDeployCommand": {
                                  "type": "string",
                                  "description": "Kblocks runs this command before the start command. Useful for database migrations and static asset uploads.\n@order 3"
                              }
                          }
                      }
                  },
                  "description": "Explicitly use a container image from a registry.\n@order 1"
              },
              "fromRepository": {
                  "type": "object",
                  "required": [
                      "repository"
                  ],
                  "properties": {
                      "repository": {
                          "type": "string",
                          "description": "The source code for the service @ui kblocks.io/repo-picker\n@order 1"
                      },
                      "branch": {
                          "type": "string",
                          "description": "The branch to use for the source code\n@order 2",
                          "default": "main"
                      },
                      "rootDirectory": {
                          "type": "string",
                          "description": "If set, Kblocks runs commands from this directory instead of the repository root. Additionally, code changes outside of this directory do not trigger an auto-deploy. Most commonly used with a monorepo.\n@order 3"
                      },
                      "language": {
                          "type": "string",
                          "description": "The programming language/framework of the source code\n@order 4",
                          "default": "Docker",
                          "enum": [
                              "Docker"
                          ]
                      },
                      "buildCommand": {
                          "type": "string",
                          "description": "Kblocks runs this command to build your app before each deploy.\n@order 5"
                      },
                      "advanced": {
                          "type": "object",
                          "description": "Advanced configuration options\n@order 6",
                          "properties": {
                              "secretFiles": {
                                  "type": "array",
                                  "items": {
                                      "type": "string"
                                  },
                                  "description": "Store plaintext files containing secret data (such as a .env file or a private key). Access during builds and at runtime from your app's root, or from /etc/secrets/<filename>.\n@order 1"
                              },
                              "preDeployCommand": {
                                  "type": "string",
                                  "description": "Kblocks runs this command before the start command. Useful for database migrations and static asset uploads.\n@order 2"
                              },
                              "autoDeploy": {
                                  "type": "string",
                                  "description": "By default, Kblocks automatically deploys your service whenever you update its code or configuration. Disable to handle deploys manually. [Learn more](https://kblocks.io/docs/deploys#automatic-git-deploys).\n@order 3",
                                  "enum": [
                                      "Yes",
                                      "No"
                                  ]
                              },
                              "buildFilters": {
                                  "type": "object",
                                  "properties": {
                                      "includePaths": {
                                          "type": "array",
                                          "items": {
                                              "type": "string"
                                          },
                                          "description": "Changes that match these paths will trigger a new build.\n@order 1"
                                      },
                                      "ignoredPaths": {
                                          "type": "array",
                                          "items": {
                                              "type": "string"
                                          },
                                          "description": "Changes that match these paths will not trigger a new build.\n@order 2"
                                      }
                                  },
                                  "description": "Include or ignore specific paths in your repo when determining whether to trigger an auto-deploy. [Learn more](https://kblocks.io/docs/monorepo-support#build-filters). Paths are relative to your repo's root directory.\n@order 4"
                              }
                          }
                      }
                  },
                  "description": "Automatically build and deploy an image from a GitHub repository.\n@order 2"
              }
          }
      },
      "schedule": {
          "type": "string",
          "description": "The schedule for the command as a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).\n@ui kblocks.io/cron-picker\n@order 2",
          "default": "*/5 * * * *"
      },
      "environmentVariables": {
          "type": "object",
          "description": "resource environment variables",
          "additionalProperties": {
              "description": "Set environment-specific config and secrets (such as API keys), then read those values from your code. [Learn more](https://kbloks.io/docs/configure-environment-variables).",
              "type": "object",
              "properties": {
                  "fromConfigMap": {
                      "type": "object",
                      "properties": {
                          "configMapName": {
                              "type": "string"
                          },
                          "key": {
                              "type": "string"
                          }
                      },
                      "required": [
                          "configMapName",
                          "key"
                      ]
                  },
                  "fromSecret": {
                      "type": "object",
                      "properties": {
                          "key": {
                              "type": "string"
                          },
                          "secretName": {
                              "type": "string"
                          }
                      },
                      "required": [
                          "key",
                          "secretName"
                      ]
                  },
                  "optional": {
                      "type": "boolean"
                  },
                  "value": {
                      "type": "string"
                  }
              }
          }
      },
      "instanceType": {
          "default": "Small",
          "type": "string",
          "enum": [
              "Micro",
              "Small",
              "Medium",
              "Large"
          ],
          "description": "The instance type to use for the service.\n\n@ui kblocks.io/instance-picker: {\"Micro\":{\"cpu\":0.5,\"memory\":128,\"storage\":1},\"Small\":{\"cpu\":1,\"memory\":256,\"storage\":1},\"Medium\":{\"cpu\":2,\"memory\":512,\"storage\":2},\"Large\":{\"cpu\":4,\"memory\":1024,\"storage\":2}}\n@order 4"
      },
      "region": {
          "description": "The region to deploy the cron job. Your services in the same [region](https://kblocks.io/docs/regions) can communicate over a [private network](https://kblocks.io/docs/private-network).\n@order 5",
          "default": "us-east-1",
          "type": "string",
          "enum": [
              "us-east-1",
              "us-west-2",
              "eu-central-1"
          ]
      }
  },
};
