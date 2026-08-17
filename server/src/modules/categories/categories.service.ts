import slugify from "slugify";
import { prisma } from "../../config/prisma";

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  courseCount: number;
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { courses: true } },
    },
  });

  // Map _count.courses to courseCount to cleanly match frontend expectations
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    courseCount: cat._count.courses,
  }));
}

export async function createCategory(name: string, description?: string): Promise<CategoryResponse> {
  const slug = slugify(name, { lower: true, strict: true });

  try {
    const category = await prisma.category.create({
      data: { name, slug, description },
      select: { id: true, name: true, slug: true, description: true },
    });
    return {
      ...category,
      courseCount: 0,
    };
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
  await prisma.category.delete({ where: { id: categoryId } });
}
