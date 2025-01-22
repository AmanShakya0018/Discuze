"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import SinglePostSkeleton from "./loading";
import { Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  createdAt: string,
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

const PostPage = () => {
  const { id } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<{ [key: string]: boolean }>({});

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

  const handleShare = (postId: string) => {
    const link = `${process.env.NEXT_PUBLIC_API_URL}/allposts/${postId}`;
    setSelectedPostId(postId);
    setOpenDialog(true);

    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
    }).catch((err) => {
      console.error("Error copying the link: ", err);
    });
  };

  const fetchComments = async (postId: string) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${postId}/comments`);
      if (post) {
        setPost({
          ...post,
          comments: response.data,
        });
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };


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
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleShare(userPost.id)}
                      className="text-zinc-500 hover:text-zinc-600 text-sm"
                    >
                      <Share2 className="h-4 w-4 mx-[2px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`
                  ).then(() => {
                    setLinkCopied(true);
                  }).catch((err) => {
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

export default PostPage;
