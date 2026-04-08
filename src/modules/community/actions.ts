"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  addCommunityComment,
  createCommunityPost,
  getUserProfile,
  toggleCommunityPostLike,
} from "@/lib/firestore/repos";

type CommunityActionResult =
  | { ok: true }
  | { ok: false; error: string };

type CommunityAuthor =
  | { ok: false; error: string }
  | { ok: true; userId: string; name: string; image: string | null };

async function requireAuthor() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Faça login para usar o mural." } satisfies CommunityAuthor;
  }

  const user = await getUserProfile(session.user.id);
  if (!user) {
    return { ok: false, error: "Perfil não encontrado." } satisfies CommunityAuthor;
  }

  return {
    ok: true,
    userId: session.user.id,
    name: user.name?.trim() || "Membro da comunidade",
    image: user.image,
  } satisfies CommunityAuthor;
}

export async function publishCommunityPost(
  content: string
): Promise<CommunityActionResult> {
  const author = await requireAuthor();
  if (!author.ok) return { ok: false, error: author.error };

  const clean = content.trim();
  if (clean.length < 4) {
    return { ok: false, error: "Escreva pelo menos 4 caracteres." };
  }

  if (clean.length > 400) {
    return { ok: false, error: "Seu post pode ter no máximo 400 caracteres." };
  }

  await createCommunityPost(author.userId, author.name, author.image, clean);
  revalidatePath("/ranking");
  return { ok: true };
}

export async function toggleCommunityLike(
  postId: string
): Promise<CommunityActionResult> {
  const author = await requireAuthor();
  if (!author.ok) return { ok: false, error: author.error };

  if (!postId.trim()) {
    return { ok: false, error: "Publicação inválida." };
  }

  await toggleCommunityPostLike(postId, author.userId);
  revalidatePath("/ranking");
  return { ok: true };
}

export async function publishCommunityComment(
  postId: string,
  content: string
): Promise<CommunityActionResult> {
  const author = await requireAuthor();
  if (!author.ok) return { ok: false, error: author.error };

  if (!postId.trim()) {
    return { ok: false, error: "Publicação inválida." };
  }

  const clean = content.trim();
  if (clean.length < 2) {
    return { ok: false, error: "O comentário está muito curto." };
  }

  if (clean.length > 280) {
    return {
      ok: false,
      error: "O comentário pode ter no máximo 280 caracteres.",
    };
  }

  await addCommunityComment(postId, author.userId, author.name, author.image, clean);
  revalidatePath("/ranking");
  return { ok: true };
}
