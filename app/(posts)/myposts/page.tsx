"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Trash } from "lucide-react";

interface Post {
  id: string;
  content: string;
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
    return <p>You must be logged in to view your posts.</p>;
  }

  if (loading) return <p className="text-white pt-20">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.length === 0 ? (
          <p className="text-xl font-bold text-black dark:text-white col-span-full">
            No posts available.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4">{post.content}</p>
              <div className="flex space-x-2">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
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
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, content: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
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
                    <>
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Myposts;