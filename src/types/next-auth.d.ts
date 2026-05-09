import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "head_coach" | "coach" | "physio" | "athlete";
    } & DefaultSession["user"];
  }
}
