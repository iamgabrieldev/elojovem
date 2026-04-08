import { redirect } from "next/navigation";

import { CommunityFeed } from "@/components/features/community/community-feed";
import { LeaderboardCard } from "@/components/features/ranking/leaderboard-card";
import { auth } from "@/lib/auth";
import {
  listCommunityComments,
  listCommunityPosts,
} from "@/lib/firestore/repos";
import { getPrayerLeaderboard } from "@/modules/community/leaderboard";

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [leaderboard, posts] = await Promise.all([
    getPrayerLeaderboard(15),
    listCommunityPosts(12),
  ]);

  const feedPosts = await Promise.all(
    posts.map(async (post) => {
      const comments = await listCommunityComments(post.id, 8);
      return {
        id: post.id,
        authorName: post.authorName,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        likedByCurrentUser: post.likedBy.includes(session.user.id),
        comments: comments.map((comment) => ({
          id: comment.id,
          authorName: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
        })),
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Ranking e Comunidade</h1>
        <p className="mt-1 text-sm text-slate-500">
          Veja quem está mais constante na oração e publique no mural da comunidade.
        </p>
      </div>

      <LeaderboardCard entries={leaderboard} />

      <CommunityFeed posts={feedPosts} />
    </div>
  );
}
