"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import PostSkeleton from "./loading";
import { MessageSquare, Share2, SquareArrowOutUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; import Link from "next/link";

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
                <div className="flex py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
                  <div className="flex gap-3 flex-grow overflow-hidden">
                    <Image
                      width={48}
                      height={48}
                      src={post.user.image || "/pfp.png"}
                      alt={post.user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                          <span className="font-bold truncate">{post.user.name}</span>
                          <span className="hidden sm:block text-neutral-500">·</span>
                          <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.75rem] sm:text-sm truncate">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-[0.95rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                        {post.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 ml-4 flex-shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            className="text-zinc-500 hover:text-zinc-600 text-sm"
                            href={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${post.id}`}
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
                          <Link
                            href={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${post.id}`}
                            target="_blank"
                            className="text-zinc-500 hover:text-zinc-600 text-sm"
                          >
                            <MessageSquare className="h-4 w-4 mx-[2px]" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Comments</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => handleShare(post.id)} className="text-zinc-500 hover:text-zinc-600 text-sm">
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
