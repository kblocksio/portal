import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@kblocks-portal/server";

export const trpc = createTRPCReact<AppRouter>();
