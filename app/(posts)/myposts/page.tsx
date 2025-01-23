"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Trash, Share2, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostSkeleton from "./loading";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Commentskeleton from "@/components/commentsskeleton";

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

interface EditFormData {
  content: string;
}

const Myposts = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({ content: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [isOverLimit, setIsOverLimit] = useState<boolean>(false);
  const [isUnderLimit, setIsUnderLimit] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/myposts`
        );
        setPosts(response.data);
      } catch (error) {
        setError(`Something went wrong, please try again. ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [session]);

  const handleDelete = async (id: string) => {
    setDeletingPostId(id);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delete/${id}`
      );
      if (response.status === 200) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingPostId(null);
    }
  };


  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ content: post.content });
    setCharCount(post.content.length);
    setIsUnderLimit(post.content.length < 1);
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPost) return;

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update/${editingPost.id}`,
        formData
      );

      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editingPost.id
              ? { ...post, content: formData.content }
              : post
          )
        );
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setIsUpdating(false);
      setEditingPost(null);
    }
  };

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

  const handleDeleteComment = async (commentId: string, postId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`)
      fetchComments(postId)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="medium" />
      </div>
    );
  }


  if (loading) return <div className="text-center"><PostSkeleton count={10} /></div>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-fit text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto mt-8">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            {posts.map((post) => (
              <div key={post.id} className="py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border">
                <div className="flex flex-grow overflow-hidden gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 truncate text-sm">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <div className="text-zinc-500 hover:text-zinc-600 text-sm">
                        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${post.id}`} target="_blank">
                          <SquareArrowOutUpRight className="h-4 w-4 mx-[2px]" />
                        </Link>
                      </div>
                    </div>
                    <p className="mt-1 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                      {post.content}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="flex items-center"
                      >
                        <Pencil className="h-4 w-4 mx-[2px]" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Content"
                            value={formData.content}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({ ...prev, content: value }));
                              setCharCount(value.length);
                              setIsOverLimit(value.length > 799);
                              setIsUnderLimit(value.length < 1);
                            }}
                          />
                          {(isUnderLimit || isOverLimit) ? (
                            <div className="text-sm text-red-500">
                              {isUnderLimit
                                ? "Post content must be at least 1 character."
                                : "Post content cannot exceed 799 characters."}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">
                              {charCount}/799 characters
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleUpdate}
                          disabled={isUpdating || isOverLimit || isUnderLimit}
                          className="w-full sm:w-auto"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Post"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingPostId === post.id}
                    className="flex items-center"
                  >
                    {deletingPostId === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4 mx-[2px]" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="flex items-center"
                  >
                    <Share2 className="h-4 w-4 mx-[2px]" />
                  </Button>
                </div>
                <div className="mt-4">
                  {commentsLoading[post.id] ? (
                    <div><Commentskeleton count={2} /></div>
                  ) : (
                    (post.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3 py-2">
                        <Image
                          width={200}
                          height={200}
                          src={comment.user.image || "/pfp.png"}
                          alt={comment.user.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                            <span className="font-bold truncate">{comment.user.name}</span>
                            <span className="hidden sm:block text-neutral-500">·</span>
                            <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.75rem] truncate">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="flex items-center justify-between text-[0.85rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                            {comment.content}
                            <button
                              onClick={() => handleDeleteComment(comment.id, post.id)}
                              className="text-xs text-red-500 hover:text-red-700 border p-1 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => fetchComments(post.id)}
                  className="text-sm text-zinc-500 mt-2 ml-1 hover:text-zinc-600"
                >
                  {commentsLoading[post.id] ? "Loading comments..." : "Load Comments"}
                </button>
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

export default Myposts;
