"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostSkeleton from "./loading";
import { Spinner } from "@/components/ui/spinner";

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
      const response = await axios.get(
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
    setCharCount(post.content.length); // Initialize char count with current post content length
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

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="medium" />
      </div>
    )
  }

  if (loading) return <div className="text-center"><PostSkeleton count={5} /></div>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto mt-8">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900/40 py-2 rounded-t-3xl border">
            {posts.map((post) => (
              <div key={post.id} className="py-4 px-6 border-b">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
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
                <div className="flex space-x-2 mt-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        className="flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
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
                              setCharCount(value.length); // Update character count
                              setIsOverLimit(value.length > 799); // Flag if over the limit
                            }}
                          />
                          <div className="text-sm text-neutral-500">
                            {charCount}/799 characters
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleUpdate}
                          disabled={isUpdating || isOverLimit}
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
                      <Trash className="h-4 w-4 mr-1" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Myposts;
