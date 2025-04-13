"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";

import { AlertCircle, MessageSquare, Share2, SquareArrowOutUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter2,
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
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  LinkedinShareButton,
  LinkedinIcon,
} from 'next-share'
import PostSkeleton, { PostsSkeleton } from "./loading";
import { MdVerified } from "react-icons/md";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    isVerified: boolean;
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

const Home = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialloading, setInitialoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postloading, setPostLoading] = useState(false);


  const fetchPosts = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      // console.log("Fetching page:", page);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/allposts?page=${page}`);

      const fetchedPosts = Array.isArray(response.data.posts) ? response.data.posts : [];

      setPosts((prev) => [...prev, ...fetchedPosts]);
      setHasMore(response.data.hasMore);

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      setError("Something went wrong, please try again.");
      console.error("Error fetching posts:", error);
    } finally {
      setInitialoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  },);

  const handlePostSubmit = async () => {

    if (!session) {
      toast({
        description: "Login to create a post"
      })
      return;
    }

    if (!content) {
      toast({
        description: "Content is required"
      })
      return;
    }

    setPostLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create`,
        {
          userId: session?.user.id,
          content,
        }
      );

      if (response.data.success) {
        toast({
          description: "Post added successfully"
        })
        setContent("");
        const updatedPosts = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/allposts`
        );
        if (Array.isArray(updatedPosts.data.posts)) {
          setPosts(updatedPosts.data.posts);
          setHasMore(updatedPosts.data.hasMore);
          setPage(2);
        } else {
          console.error("Invalid posts data:", updatedPosts.data);
        }
      } else {
        toast({
          description: response.data.message || "Something went wrong"
        })
      }
    } catch (error) {
      toast({
        description: `failed to add post. Please try again ${error}`
      })
    } finally {
      setPostLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 799) {
      setContent(value);
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

  if (initialloading) return <div className="text-center"><PostSkeleton count={10} /></div>;
  if (error) return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div>
        <Card className="border border-neutral-200 dark:border-neutral-700 shadow-lg bg-white dark:bg-neutral-900">
          <CardHeader className="pb-0">
            <div className="w-full flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 text-red-500 dark:text-red-400">
                <AlertCircle size={32} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <p className="text-neutral-600 dark:text-neutral-300">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );


  return (
    <div className="min-h-fit text-neutral-800 dark:text-neutral-100">
      <div className="max-w-2xl mx-auto mt-8">
        {/*  */}
        <div className="flex py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl mb-6">
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="flex flex-row items-start gap-2">
              <Link href={"/profile"}>
                <Image
                  width={500}
                  height={500}
                  src={session?.user.image || "/pfp.png"}
                  alt={session?.user.name || "pfp.png"}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              </Link>
              <Link href={"/profile"}>
                <div className="flex flex-col items-center justify-between max-w-fit">
                  {session?.user.name ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                        <p className="font-bold truncate hover:underline">{session?.user.name}</p>
                      </div>
                      <p className="text-sm truncate text-neutral-500 -mt-1">@{session?.user.name?.toLowerCase().replace(/\s+/g, "")}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                        <p className="font-bold truncate">Unknown User</p>
                      </div>
                      <p className="text-sm truncate text-neutral-500 -mt-1">@unknownuser
                      </p>
                    </>
                  )}
                </div>
              </Link>
            </div>
            <div className="flex flex-col text-[0.85rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
              <div>
                <textarea
                  placeholder="What is happening?!"
                  value={content}
                  onChange={handleContentChange}
                  className="border bg-neutral-100 dark:bg-neutral-950  border-neutral-200 dark:border-neutral-800 rounded-md p-2 mt-2 w-full max-w-full h-24"
                ></textarea>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-neutral-500 mb-2">
                  {799 - content.length} characters remaining
                </span>
                <button className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-500 border px-5 py-2 rounded-lg"
                  onClick={handlePostSubmit}
                  disabled={loading}
                >
                  {postloading ? (
                    <div role="status" className="flex items-center h-5 w-6">
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-white ml-1"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/*  */}
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500">No posts available.</p>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchPosts}
            hasMore={hasMore}
            loader={<div className="text-center"><PostsSkeleton count={2} /></div>}
          // endMessage={<p className="text-center">no more posts</p>}
          >
            <div className="flex flex-col gap-3 pb-4">
              {posts.map((post) => (
                <div key={post.id} className="flex py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
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
                        <div className="flex sm:flex-row flex-col items-start gap-2 text-sm truncate">
                          <div className="flex flex-col justify-between truncate">
                            <Link href={`/profile/${post.user.id}`} target="_blank">
                              <p className="font-bold flex items-center gap-1 truncate hover:underline">{post.user.name}
                                {post.user.isVerified && <MdVerified size={13} fill="#1D9BF0" className="mt-[2px]" />}
                              </p>
                            </Link>
                            <p className="text-sm truncate text-neutral-500 -mt-1">
                              @{post.user.name.toLowerCase().replace(/\s+/g, "")}
                            </p>
                          </div>
                          <p className="hidden sm:block text-neutral-500">·</p>
                          <p className="text-neutral-500 -mt-2 sm:mt-0 text-[0.725rem] sm:text-sm truncate">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </p>
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
                            href={`/allposts/${post.id}`}
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
                            href={`/allposts/${post.id}`}
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
              ))}
            </div>
          </InfiniteScroll>
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
          <DialogFooter2 className="flex-row space-x-1 justify-between items-center">
            <FacebookShareButton
              url={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`}
              quote={'Join the discussion and share your thoughts on the latest tech topics!'}
              hashtag={'#discuze'}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton
              url={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`}
              title={'Join the discussion and share your thoughts on the latest tech topics!'}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <WhatsappShareButton
              url={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`}
              title={'Join the discussion and share your thoughts on the latest tech topics!'}
              separator=":: "
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={`${process.env.NEXT_PUBLIC_API_URL}/allposts/${selectedPostId}`}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <div>
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
            </div>
          </DialogFooter2>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
