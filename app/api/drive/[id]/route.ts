// app/api/drive/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { ActivityAction } from "@/lib/generated/prisma/enums";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withAuthenticatedUser(request, async (authUser) => {
    // ← await params — required in Next.js 15
    const { id: projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 },
      );
    }

    // Verify project belongs to this user
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: authUser.id },
      include: { files: { where: { isDeleted: false } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Soft delete all files inside the project
    await prisma.dbFile.updateMany({
      where: { projectId, ownerId: authUser.id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // Log activity for each file deleted
    if (project.files.length > 0) {
      await prisma.activityLog.createMany({
        data: project.files.map((file) => ({
          ownerId: authUser.id,
          fileId: file.id,
          action: ActivityAction.DELETE,
          description: `Deleted file ${file.name} (project deleted)`,
        })),
      });
    }

    // await prisma.activityLog.create({
    //   data: {
    //     ownerId: authUser.id,
    //     projectId,
    //     action: ActivityAction.DELETE,
    //     description: `Deleted folder ${project.name}`,
    //   },
    // });

    // Hard delete the project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
  data: {
    ownerId: authUser.id,
    projectId,
    projectName:project.name,
    action: ActivityAction.DELETE,
    description: `Deleted folder ${project.name}`,
  },
});

    return NextResponse.json({
      ok: true,
      message: "Project deleted successfully",
    });
  });
}
