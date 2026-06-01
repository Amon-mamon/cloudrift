import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { DbFileType } from "@/lib/generated/prisma/enums";
import { serializeForJson } from "@/lib/serialize";

const createFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  type: z.enum(DbFileType).default("OTHER"),
  projectId: z.string().uuid().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  engine: z.string().optional(),
  storagePath: z.string().optional(),
});

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const files = await prisma.dbFile.findMany({
      where: { ownerId: authUser.id },
      include: { project: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(serializeForJson({ files }));
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const parsed = createFileSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid file data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    if (parsed.data.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: parsed.data.projectId,
          ownerId: authUser.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found for this user." },
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
        sizeBytes: parsed.data.sizeBytes,
        engine: parsed.data.engine,
        storagePath: parsed.data.storagePath,
      },
    });

    return NextResponse.json(serializeForJson({ file }), { status: 201 });
  });
}

export async function DELETE(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const body = await request.json();
    const fileId = typeof body.fileId === "string" ? body.fileId : null;

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const file = await prisma.dbFile.findFirst({
      where: { id: fileId, ownerId: authUser.id },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.dbFile.delete({ where: { id: fileId } });

    return NextResponse.json({ ok: true });
  });
}
