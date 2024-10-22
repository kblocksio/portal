import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card.js";

export interface SignInErrorProps {
  status?: number;
  code?: string;
  name: string;
  message: string;
}

export const SignInError = ({
  status,
  code,
  name,
  message,
}: SignInErrorProps) => {
  const tryAgain = () => {
    location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-destructive h-6 w-6" />
            <CardTitle className="text-destructive text-2xl font-bold">
              Sign In Error
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Status
              </span>
              <span className="text-lg font-bold">{status}</span>
            </div>
          )}
          {code && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Code
              </span>
              <span className="bg-muted rounded px-2 py-1 font-mono text-lg">
                {code}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Name
            </span>
            <span className="text-lg">{name}</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">
              Message
            </span>
            <p className="text-sm">{message}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="default" onClick={tryAgain}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
