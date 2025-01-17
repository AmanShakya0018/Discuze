import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import prisma from "@/lib/db"
import { CommentForm } from "@/components/commentform"

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        comment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return posts
  } catch (error) {
    console.error("Error while fetching data: ", error)
    return []
  }
}

export default async function AllPosts() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900/40 mt-8 py-2 rounded-t-3xl border">
            {posts.map((post) => (
              <div key={post.id} className="py-4 px-6 border-b">
                <div className="flex gap-3">
                  <Image
                    width={48}
                    height={48}
                    src={post.user.image || "/pfp.png"}
                    alt={post.user.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold truncate">{post.user.name}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-500 truncate">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                </div>
                <CommentForm postId={post.id} />
                <div className="mt-4">
                  {post.comment.length > 0 ? (
                    <div>
                      {post.comment.map((comment) => (
                        <div key={comment.id} className="p-2 mt-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-neutral-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No comments yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

