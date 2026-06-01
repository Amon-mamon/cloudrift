import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const email = authUser.email ?? "";
  const firstName =
    typeof authUser.user_metadata?.first_name === "string"
      ? authUser.user_metadata.first_name
      : "";
  const lastName =
    typeof authUser.user_metadata?.last_name === "string"
      ? authUser.user_metadata.last_name
      : "";

  const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        email,
        firstName: firstName || "CloudRift",
        lastName: lastName || "User",
      },
      create: {
        id: authUser.id,
        email,
        firstName: firstName || "CloudRift",
        lastName: lastName || "User",
        provider: "supabase",
      },
    });

    return NextResponse.json({ user });
  });
}
