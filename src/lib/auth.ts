import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client, db } from "@/lib/db";

export const auth = betterAuth({
  //...
 baseURL: process.env.BETTER_AUTH_URL,
 emailAndPassword: { 
    enabled: true, 
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "employee",
        input: true,
      },
      // Admin-managed only (input: false) — set via the users dashboard.
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
   socialProviders: {
        google: { // [!code highlight]
            clientId: process.env.GOOGLE_CLIENT_ID as string, // [!code highlight]
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // [!code highlight]
        }, // [!code highlight]
    },
  database: mongodbAdapter(db, {
    client,
  }),
});