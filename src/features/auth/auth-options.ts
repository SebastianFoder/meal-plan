import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
