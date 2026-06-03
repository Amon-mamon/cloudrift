import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeForJson } from "@/lib/serialize";
import { withAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const [projectCount, fileCount, sharedWithMeCount, aiAnalyzedCount, storage, recentFiles] =
    await Promise.all([
      prisma.project.count({ where: { ownerId: authUser.id } }),
      prisma.dbFile.count({ where: { ownerId: authUser.id, isDeleted: false } }),
      prisma.fileShare.count({
        where: {
          OR: [
            { sharedWithUserId: authUser.id },
            { sharedWithEmail: authUser.email ?? "" },
          ],
        },
      }),
      prisma.dbFile.count({
        where: { ownerId: authUser.id, aiAnalyzed: true, isDeleted: false },
      }),
      prisma.dbFile.aggregate({
        where: { ownerId: authUser.id, isDeleted: false },
        _sum: { sizeBytes: true },
      }),
      prisma.dbFile.findMany({
        where: { ownerId: authUser.id, isDeleted: false },
        include: { project: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json(serializeForJson({
      stats: {
        projectCount,
        fileCount,
        sharedWithMeCount,
        aiAnalyzedCount,
        storageBytes: storage._sum.sizeBytes ?? BigInt(0),
      },
      recentFiles,
    }));
  });
}
