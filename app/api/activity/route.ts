import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { serializeForJson } from "@/lib/serialize";

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const activity = await prisma.activityLog.findMany({
      where: { ownerId: authUser.id },
      include: {
        file: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(serializeForJson({ activity }));
  });
}
