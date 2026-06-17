import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { ActivityAction, DbFileType } from "@/lib/generated/prisma/enums";
import { serializeForJson } from "@/lib/serialize";

const createFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  type: z.enum(DbFileType).default("OTHER"),
  projectId: z.string().uuid().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  engine: z.string().optional(),
  storagePath: z.string().optional(),
});

export async function PATCH(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const body = await request.json();

    const projectId =
      typeof body.projectId === "string"
        ? body.projectId
        : null;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    // restore project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    // restore files
    await prisma.dbFile.updateMany({
      where: {
        projectId,
        ownerId: authUser.id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        ownerId: authUser.id,
        projectId,
        action: ActivityAction.RESTORE,
        description: "Restored folder",
      },
    });

    return NextResponse.json({
      ok: true,
    });
  });
}


export async function POST(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const parsed = createFileSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid file data",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { projectId } = parsed.data;

    // Verify project belongs to user
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: authUser.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    const file = await prisma.dbFile.create({
      data: {
        ownerId: authUser.id,
        name: parsed.data.name,
        type: parsed.data.type,
        projectId: parsed.data.projectId,
        sizeBytes: parsed.data.sizeBytes ?? 0,
        engine: parsed.data.engine,
        storagePath: parsed.data.storagePath,
      },
    });

    await prisma.activityLog.create({
      data: {
        ownerId: authUser.id,
        fileId: file.id,
        action: ActivityAction.CREATE,
        description: `Created file ${file.name}`,
      },
    });

    return NextResponse.json(
      {
        file: serializeForJson(file),
      },
      { status: 201 }
    );
  });
}

export async function DELETE(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const body = await request.json();

    const fileId =
      typeof body.fileId === "string" ? body.fileId : null;

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId" },
        { status: 400 }
      );
    }
    

    const file = await prisma.dbFile.findFirst({
      where: {
        id: fileId,
        ownerId: authUser.id,
        isDeleted: false,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    await prisma.dbFile.update({
      where: {
        id: fileId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        ownerId: authUser.id,
        fileId,
        action: ActivityAction.DELETE,
        description: `Deleted file ${file.name}`,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "File deleted successfully",
    });
  });
}