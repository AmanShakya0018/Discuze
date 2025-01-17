"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

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

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/allposts`
        );
        setPosts(response.data);
      } catch (error) {
        setError("Something went wrong, please try again.");
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900/40 mt-8 py-2 rounded-t-3xl border">
            {posts.map((post) => (
              <div key={post.id}>
                <div className="py-4 px-6 border-b">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
