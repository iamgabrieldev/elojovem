"use client";

import { Heart, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  publishCommunityComment,
  publishCommunityPost,
  toggleCommunityLike,
} from "@/modules/community/actions";
import { cn } from "@/lib/utils";

type CommunityFeedComment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

type CommunityFeedPost = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  comments: CommunityFeedComment[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunityFeed({
  posts,
}: {
  posts: CommunityFeedPost[];
}) {
  const router = useRouter();
  const [postText, setPostText] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string | null>>(
    {}
  );
  const [pending, startTransition] = useTransition();

  const remaining = useMemo(() => 400 - postText.length, [postText.length]);

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Mural da comunidade
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Compartilhe no seu mural
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Poste um pedido, testemunho, reflexão ou motivação para a comunidade.
        </p>

        <textarea
          value={postText}
          onChange={(event) => {
            setPostText(event.target.value);
            if (postError) setPostError(null);
          }}
          rows={4}
          maxLength={400}
          placeholder="O que Deus colocou no seu coração hoje?"
          className="mt-4 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            {postError ? (
              <p className="text-sm text-red-600">{postError}</p>
            ) : (
              <p className="text-xs text-slate-500">{remaining} caracteres restantes</p>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            loading={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await publishCommunityPost(postText);
                if (!result.ok) {
                  setPostError(result.error);
                  return;
                }

                setPostText("");
                setPostError(null);
                router.refresh();
              });
            }}
          >
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        </div>
      </Card>

      {posts.length === 0 ? (
        <Card className="border-dashed border-slate-200 text-center text-sm text-slate-500">
          Ainda não há publicações no mural. Seja a primeira pessoa a compartilhar algo.
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="border-slate-200/80 bg-white/95">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {initials(post.authorName)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {post.authorName}
                  </p>
                  <span className="text-xs text-slate-400">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {post.content}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={post.likedByCurrentUser ? "primary" : "secondary"}
                    className={cn(
                      "rounded-xl",
                      post.likedByCurrentUser && "bg-rose-500 hover:bg-rose-600"
                    )}
                    loading={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const result = await toggleCommunityLike(post.id);
                        if (result.ok) {
                          router.refresh();
                        }
                      });
                    }}
                  >
                    <Heart className="h-4 w-4" />
                    {post.likeCount}
                  </Button>
                  <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                    <MessageCircle className="h-4 w-4" />
                    {post.commentCount} comentários
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Respostas da comunidade
                  </p>

                  {post.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Ainda não há comentários. Seja o primeiro a responder.
                    </p>
                  ) : (
                    post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-2xl border border-white bg-white px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {comment.authorName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}

                  <div className="space-y-2">
                    <textarea
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(event) => {
                        setCommentDrafts((current) => ({
                          ...current,
                          [post.id]: event.target.value,
                        }));
                        if (commentErrors[post.id]) {
                          setCommentErrors((current) => ({
                            ...current,
                            [post.id]: null,
                          }));
                        }
                      }}
                      rows={2}
                      maxLength={280}
                      placeholder="Escreva um comentário..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-300"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-red-600">
                        {commentErrors[post.id] ?? ""}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="rounded-xl"
                        loading={pending}
                        onClick={() => {
                          startTransition(async () => {
                            const result = await publishCommunityComment(
                              post.id,
                              commentDrafts[post.id] ?? ""
                            );

                            if (!result.ok) {
                              setCommentErrors((current) => ({
                                ...current,
                                [post.id]: result.error,
                              }));
                              return;
                            }

                            setCommentDrafts((current) => ({
                              ...current,
                              [post.id]: "",
                            }));
                            setCommentErrors((current) => ({
                              ...current,
                              [post.id]: null,
                            }));
                            router.refresh();
                          });
                        }}
                      >
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
