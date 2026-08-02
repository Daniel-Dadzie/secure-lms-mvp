import slugify from "slugify";
import { prisma } from "../../config/prisma";

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  _count?: { courses: number };
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { courses: true } },
    },
  });
}
 
export async function createCategory(name: string): Promise<CategoryResponse> {
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    const error = new Error("Category already exists");
    (error as any).statusCode = 409;
    throw error;
  }

  // The existing check above has a TOCTOU race window — two near-simultaneous
  // create calls (unlikely for an admin-only, low-frequency action, but still
  // a real gap) could both pass it before either insert commits. The DB's
  // @unique constraint on slug/name is the real guarantee; this catch converts
  // that low-level violation into the same clean 409 instead of an unhandled 500.
  try {
    return await prisma.category.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      const error = new Error("Category already exists");
      (error as any).statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  // SetNull on Course.categoryId means courses keep existing
  // but lose their category — intentional, not destructive
  await prisma.category.delete({ where: { id: categoryId } });
}