// app/api/drive/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { serializeForJson } from "@/lib/serialize";
import { ActivityAction } from "@/lib/generated/prisma/enums";

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const projects = await prisma.project.findMany({
      where: { ownerId: authUser.id },
      include: {
        files: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(serializeForJson({ projects }));
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {  // ← fixed: removed stray `t`
    const body = await request.json();
    const { name, engine, color } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        ownerId: authUser.id,
        name: name.trim(),
        engine: engine ?? null,
        color: color ?? null,
      },
    });

    await prisma.activityLog.create({
      data: {
        ownerId: authUser.id,
        action: ActivityAction.CREATE,
        description: `Created project ${project.name}`,
      },
    });

    return NextResponse.json(serializeForJson({ project }), { status: 201 });
  });
}
