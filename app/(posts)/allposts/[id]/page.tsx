"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import SinglePostSkeleton from "./loading";

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
}

const PostPage = () => {
  const { id } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${id}`);
        setPost(response.data);
        const userId = response.data.user.id;

        const userPostsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/userposts/${userId}`
        );

        // Filter out the current post from the user posts
        const filteredPosts = userPostsResponse.data.filter(
          (userPost: Post) => userPost.id !== response.data.id
        );
        setUserPosts(filteredPosts);
      } catch (error) {
        setError("Error fetching post.");
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center"><SinglePostSkeleton count={5} /></div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-fit text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto py-8">
        {post ? (
          <div className="py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
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
          </div>
        ) : (
          <p className="text-center text-neutral-500">Post not found.</p>
        )}

        {userPosts.length > 0 && post && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Other posts from this user</h2>
            <div className="space-y-4 mt-4">
              {userPosts.map((userPost) => (
                <div key={userPost.id} className="py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
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
                        <span className="font-bold truncate">{post.user.name || "Unknown User"}</span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-neutral-500 truncate">
                          {formatDistanceToNow(new Date(userPost.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                        {userPost.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
