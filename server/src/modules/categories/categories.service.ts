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

  return prisma.category.create({
    data: { name, slug },
    select: { id: true, name: true, slug: true },
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  // SetNull on Course.categoryId means courses keep existing
  // but lose their category — intentional, not destructive
  await prisma.category.delete({ where: { id: categoryId } });
}