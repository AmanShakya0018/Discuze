"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useParams } from "next/navigation";
import { BriefcaseBusiness, CalendarDays, MessageSquare, Share2, SquareArrowOutUpRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter2, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PostSkeleton from "./loading";
import { MdVerified } from "react-icons/md";

interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
  createdAt: string;
  isVerified: boolean;
  bio?: string;
  occupation: string;
  Post: { id: string; content: string; createdAt: string }[];
}

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      console.error("No id found in URL.");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/userprofile/${id}`);
        // console.log("User profile response:", res.data);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

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
  if (!user) return <p className="text-center mt-10 text-red-500">User not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div>
        <div className="flex flex-col gap-3 max-w-fit ml-2 mb-6">
          <Image
            width={500}
            height={500}
            priority
            quality={95}
            src={user.image || "/pfp.png"}
            alt={"pfp.png"}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
              <div className="flex flex-col truncate">
                <p className="font-bold flex items-center gap-1 text-lg truncate">{user.name}
                  {user.isVerified && <MdVerified size={16} fill="#1D9BF0" />}
                </p>
                <p className="font-medium text-sm truncate text-neutral-500 -mt-1">@{user.name?.toLowerCase().replace(/\s+/g, "")}
                </p>
                {user.bio &&
                  <p className="text-black dark:text-white text-wrap truncate text-sm flex items-center gap-1 mt-2 mb-1">
                    {user.bio}
                  </p>}
                <p className="text-neutral-500 truncate text-sm flex items-center gap-1 mt-1">
                  <BriefcaseBusiness className="h-4 w-4" />{user.occupation}
                </p>
                <p className="text-neutral-500 truncate text-sm flex items-center gap-1 mt-1">
                  <CalendarDays className="h-4 w-4" />Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM dd, yyyy") : "Date not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="dark:text-white text-zinc-950 bg-transparent font-bold w-20 h-8 overflow-hidden mb-2 ml-1">
          <div
            className='text-sm flex items-center justify-center border-b-4 border-emerald-500 w-20 h-8 space-x-1 mb-1.5'>
            <span>Posts</span>
          </div>
        </div>
      </div>
      {user.Post.length > 0 ? (
        <div className="mt-4 space-y-4">
          {user.Post.map((post) => (
            <div key={post.id}>
              <div className="flex py-4 px-6 bg-zinc-50 dark:bg-zinc-900/40 border rounded-xl">
                <div className="flex gap-3 flex-grow overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    priority={true}
                    src={user.image || "/pfp.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex sm:flex-row flex-col items-start gap-2 text-sm truncate">
                        <div className="flex flex-col justify-between truncate">
                          <p className="font-bold flex items-center gap-1 truncate">{user.name}
                            {user.isVerified && <MdVerified size={13} fill="#1D9BF0" className="mt-[2px]" />}
                          </p>
                          <p className="text-sm truncate text-neutral-500 -mt-1">@{user.name.toLowerCase().replace(/\s+/g, "")}
                          </p>
                        </div>
                        <p className="hidden sm:block text-neutral-500">·</p>
                        <p className="text-neutral-500 -mt-2 sm:mt-0 text-[0.725rem] sm:text-sm truncate">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
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
      ) : (
        <p className="text-center text-neutral-500 pt-4">No posts available.</p>
      )}

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
}
