import { prisma } from "../../config/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getAllHelpArticles(includeUnpublished = true) {
  return prisma.helpArticle.findMany({
    where: includeUnpublished ? {} : { isPublished: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
}

export async function getPublishedHelpArticles() {
  return getAllHelpArticles(false);
}

export async function createHelpArticle(data: {
  title: string;
  content: string;
  category: string;
  isPublished?: boolean;
  order?: number;
}) {
  const slug = slugify(data.title);
  return prisma.helpArticle.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      category: data.category,
      isPublished: data.isPublished ?? false,
      order: data.order ?? 0,
    },
  });
}

export async function updateHelpArticle(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    category: string;
    isPublished: boolean;
    order: number;
  }>
) {
  const article = await prisma.helpArticle.findUnique({ where: { id } });
  if (!article) {
    const error = new Error("Help article not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return prisma.helpArticle.update({
    where: { id },
    data: {
      ...data,
      ...(data.title && { slug: slugify(data.title) }),
    },
  });
}

export async function deleteHelpArticle(id: string) {
  const article = await prisma.helpArticle.findUnique({ where: { id } });
  if (!article) {
    const error = new Error("Help article not found");
    (error as any).statusCode = 404;
    throw error;
  }
  await prisma.helpArticle.delete({ where: { id } });
}
