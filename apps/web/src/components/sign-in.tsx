import { Loader2, GithubIcon } from "lucide-react";
import { Button } from "./ui/button.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card.js";
import { useSignIn } from "~/hooks/use-sign-in.js";

export const SignIn = () => {
  const { signIn, isSigningIn } = useSignIn();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Use your GitHub account to access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">
              We use GitHub for authentication to provide a secure and seamless
              sign-in experience. Click the button below to continue with
              GitHub.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={signIn} disabled={isSigningIn}>
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <GithubIcon className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
