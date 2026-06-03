import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { serializeForJson } from "@/lib/serialize";
import { ActivityAction, FileSharePermission } from "@/lib/generated/prisma/enums";

const createShareSchema = z.object({
  fileId: z.string().uuid(),
  sharedWithEmail: z.string().email(),
  sharedWithUserId: z.string().uuid().optional(),
  permission: z.enum(FileSharePermission).default("READ_ONLY"),
});

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const url = new URL(request.url);
    const ownerView = url.searchParams.get("owner") === "true";

    const shares = await prisma.fileShare.findMany({
      where: ownerView
        ? { ownerId: authUser.id }
        : {
            OR: [
              { sharedWithUserId: authUser.id },
              { sharedWithEmail: authUser.email ?? "" },
            ],
          },
      include: {
        owner: true,
        sharedWithUser: true,
        file: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(serializeForJson({ shares }));
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {

  const parsed = createShareSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid share data", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const file = await prisma.dbFile.findFirst({
    where: {
      id: parsed.data.fileId,
      ownerId: authUser.id,
      isDeleted: false,
    },
  });

    if (!file) {
      return NextResponse.json(
        { error: "File not found for this user." },
        { status: 404 }
      );
    }

    const share = await prisma.fileShare.upsert({
      where: {
        fileId_sharedWithEmail: {
          fileId: parsed.data.fileId,
          sharedWithEmail: parsed.data.sharedWithEmail,
        },
      },
      update: {
        sharedWithUserId: parsed.data.sharedWithUserId,
        permission: parsed.data.permission,
      },
      create: {
        fileId: parsed.data.fileId,
        ownerId: authUser.id,
        sharedWithEmail: parsed.data.sharedWithEmail,
        sharedWithUserId: parsed.data.sharedWithUserId,
        permission: parsed.data.permission,
      },
    });

    await prisma.activityLog.create({
      data: {
        ownerId: authUser.id,
        fileId: parsed.data.fileId,
        action: ActivityAction.SHARE,
        description: `Shared file with ${parsed.data.sharedWithEmail} (${parsed.data.permission})`,
      },
    });

    return NextResponse.json(serializeForJson({ share }), { status: 201 });
  });
}
