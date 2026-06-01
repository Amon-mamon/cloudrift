import { NextResponse } from "next/server";
import { withAuthenticatedUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const userId = authUser.id;

    // DEV-only logging: show verified user id locally (never log tokens)
    if (process.env.NODE_ENV !== "production") {
      console.log("DEV: authenticated user id =", userId);
    }

    // Example: safely query DB using verified user id
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return NextResponse.json({ ok: true, userId, user });
  });
}
