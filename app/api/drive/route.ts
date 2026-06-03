import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { withAuthenticatedUser } from "@/lib/auth";
import { serializeForJson } from "@/lib/serialize";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  engine: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const projects = await prisma.project.findMany({
      where: { ownerId: authUser.id },
      include: {
        files: {
          where: { ownerId: authUser.id, isDeleted: false },
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(serializeForJson({ projects }));
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(request, async (authUser) => {
    const parsed = createProjectSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project data", details: parsed.error.format() },
        { status: 400 }
      );
    }
      console.log("authUser.id =", authUser.id);
      const user = await prisma.user.findUnique({
        where: {
          id: authUser.id,
        },
      });
    console.log("user =", user);
   
    const project = await prisma.project.create({
      data: {
        ownerId: authUser.id,
        name: parsed.data.name,
        engine: parsed.data.engine,
        color: parsed.data.color,
      },
    });

   

    return NextResponse.json({ project }, { status: 201 });
  });
}
