"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import PostSkeleton from "./loading";
import { Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommentForm } from "@/components/commentform";

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
  comments: Comment[];
}

interface Comment {
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
  const [commentsLoading, setCommentsLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/allposts`);
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

  const fetchComments = async (postId: string) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${postId}/comments`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data } : post
        )
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = (postId: string) => {
    const link = `${process.env.NEXT_PUBLIC_API_URL}/allposts/${postId}`;
    setSelectedPostId(postId);
    setOpenDialog(true);

    navigator.clipboard
      .writeText(link)
      .then(() => {
        setLinkCopied(true);
      })
      .catch((err) => {
        console.error("Error copying the link: ", err);
      });
  };

  if (loading) return <div className="text-center"><PostSkeleton count={10} /></div>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-fit text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <div className="flex flex-col gap-3 mt-8 py-2">
            {posts.map((post) => (
              <div key={post.id}>
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
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleShare(post.id)}
                      className="text-zinc-500 hover:text-zinc-600 text-sm"
                    >
                      <Share2 className="h-4 w-4 mx-[2px]" />
                    </button>
                  </div>
                  <CommentForm postId={post.id} />
                  <div className="mt-4">
                    {commentsLoading[post.id] ? (
                      <div>Loading comments...</div>
                    ) : (
                      (post.comments || []).map((comment) => (
                        <div key={comment.id} className="flex gap-3 py-2">
                          <Image
                            width={32}
                            height={32}
                            src={comment.user.image || "/pfp.png"}
                            alt={comment.user.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold truncate">{comment.user.name}</span>
                              <span className="text-neutral-500">·</span>
                              <span className="text-neutral-500 truncate">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-neutral-800 dark:text-neutral-200">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => fetchComments(post.id)}
                    className="text-sm text-zinc-500 mt-2 hover:text-zinc-600"
                  >
                    {commentsLoading[post.id] ? "Loading comments..." : "Load Comments"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>
              Copy the link to share this post with others.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postLink" className="text-right">
                Post Link
              </Label>
              <Input
                id="postLink"
                value={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`}
                readOnly
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedPostId) {
                  navigator.clipboard
                    .writeText(
                      `${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`
                    )
                    .then(() => {
                      setLinkCopied(true);
                    })
                    .catch((err) => {
                      console.error("Error copying the link: ", err);
                    });
                }
              }}
              variant="outline"
              className="w-full"
            >
              {linkCopied ? "Link Copied!" : "Copy Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllPosts;
