"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import SinglePostSkeleton from "./loading";
import { Share2, SquareArrowOutUpRight, Trash2, } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const { id } = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const userId = session?.user?.id

  useEffect(() => {
    if (!id) return;

    const fetchPostAndComments = async () => {
      try {
        setLoading(true);

        const postResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${id}`
        );
        const postData = postResponse.data;
        const userPostsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/userposts/${postData.user.id}`
        );
        const filteredPosts = userPostsResponse.data.filter(
          (userPost: Post) => userPost.id !== postData.id
        );

        const commentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${id}/comments`
        );

        setPost({ ...postData, comments: commentsResponse.data });
        setUserPosts(filteredPosts);
      } catch (error) {
        setError("Error fetching post and comments.");
        console.error("Error fetching post and comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
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
    }
  };

  const handleSubmit = async (event: React.FormEvent, postId: string) => {
    event.preventDefault()
    if (!comment) {
      toast({
        description: "Comment content is required"
      })
      return
    }

    if (comment.length > 499) {
      toast({
        description: "Comment must be 499 characters or less",
      });
      return;
    }


    if (!userId) {
      toast({
        description: "You must be logged in to comment"
      })
      return
    }
    setSubmittingComment(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        postId,
        content: comment,
        userId,
      })

      if (response.data.success) {
        toast({
          description: "Comment added successfully!"
        })
        fetchComments(postId);
        setComment("")
        setIsDialogOpen(false)
        router.refresh()
      } else {
        toast({
          description: response.data.message || "Failed to add comment"
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        description: "An error occurred while adding the comment."
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`)
      fetchComments(post!.id)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }


  if (loading) return <div className="text-center"><SinglePostSkeleton count={5} /></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-screen text-neutral-800 dark:text-neutral-300 bg-transparent">
    <h1 className="text-5xl font-bold mb-4">404</h1>
    <p className="text-lg mb-6 text-center">
      Oops! The page you&apos;re looking for doesn&apos;t exist.
    </p>
    <Link
      href="/"
    >
      <Button>
        Go Back Home
      </Button>
    </Link>
  </div>;

  return (
    <div className="min-h-fit text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto py-8">
        {post ? (
          <div className="py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
            <div className="flex gap-3">
              <Link href={`/profile/${post.user.id}`} target="_blank">
                <Image
                  width={500}
                  height={500}
                  src={post.user.image || "/pfp.png"}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start gap-2 text-sm truncate">
                  <div className="flex flex-col justify-between truncate">
                    <Link href={`/profile/${post.user.id}`} target="_blank">
                      <p className="font-bold truncate">{post.user.name}</p>
                    </Link>
                    <p className="text-sm truncate text-neutral-500 -mt-1">@{post.user.name.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>
                  <span className="hidden sm:block text-neutral-500">·</span>
                  <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.75rem] sm:text-sm truncate">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-[0.95rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                  {post.content}
                </p>
              </div>
            </div>
            <div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="bg-neutral-100 dark:bg-neutral-900 h-8 px-2 w-full border-b-2 border-neutral-200 dark:border-neutral-800 text-start text-neutral-500 text-xs mt-4 rounded-t-md">Add Comment...</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] sm:top-1/2 sm:-translate-y-1/2 top-40">
                  <DialogHeader>
                    <DialogTitle>Add a Comment</DialogTitle>
                    <DialogDescription>Enter your comment below. Click submit when you&apos;re done.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => handleSubmit(e, post!.id)}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="comment" className="text-right">
                          Comment
                        </Label>
                        <Input
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="col-span-3"
                          disabled={submittingComment}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submittingComment}>
                        {submittingComment ? "Submitting..." : "Submit Comment"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4">
              {post?.comments && post.comments.length > 0 ? (
                <div className="font-semibold truncate mb-2">Comments</div>
              ) : (<span></span>)}
              {post?.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 py-2">
                    <Image
                      width={500}
                      height={500}
                      src={comment.user.image || "/pfp.png"}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start gap-2 text-sm truncate">
                        <div className="flex flex-col justify-between truncate">
                          <p className="font-bold truncate">{comment.user.name}</p>
                          <p className="text-sm truncate text-neutral-500 -mt-1">@{comment.user.name.toLowerCase().replace(/\s+/g, "")}
                          </p>
                        </div>
                        <span className="hidden sm:block text-neutral-500">·</span>
                        <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.725rem] truncate">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex gap-1 items-center justify-between">
                        <p className="text-[0.85rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                          {comment.content}
                        </p>
                        {comment.user.id === session?.user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700 border p-1 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 text-sm text-center py-4">
                  No comments available.
                </div>
              )}
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
                <div key={userPost.id}>
                  <div className="flex py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
                    <div className="flex gap-3 flex-grow overflow-hidden">
                      <Link href={`/profile/${post.user.id}`} target="_blank">
                        <Image
                          width={500}
                          height={500}
                          src={post.user.image || "/pfp.png"}
                          alt={post.user.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col sm:flex-row items-start gap-2 text-sm truncate">
                            <div className="flex flex-col justify-between truncate">
                              <Link href={`/profile/${post.user.id}`} target="_blank">
                                <p className="font-bold truncate">{post.user.name}</p>
                              </Link>
                              <p className="text-sm truncate text-neutral-500 -mt-1">@{post.user.name.toLowerCase().replace(/\s+/g, "")}
                              </p>
                            </div>
                            <span className="hidden sm:block text-neutral-500">·</span>
                            <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.725rem] sm:text-sm truncate">
                              {formatDistanceToNow(new Date(userPost.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-[0.95rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                          {userPost.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 ml-4 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              className="text-zinc-500 hover:text-zinc-600 text-sm"
                              href={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${userPost.id}`}
                              target="_blank"
                            >
                              <SquareArrowOutUpRight className="h-4 w-4 mx-[2px]" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Post</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleShare(userPost.id)} className="text-zinc-500 hover:text-zinc-600 text-sm">
                              <Share2 className="h-4 w-4 mx-[2px]" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px] sm:top-1/2 sm:-translate-y-1/2 top-40">
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
