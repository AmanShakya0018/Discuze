"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter2, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Trash, Share2, SquareArrowOutUpRight, Trash2, CalendarDays, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import PostSkeleton from "./loading";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import { toast } from "@/hooks/use-toast"
import Commentskeleton from "@/components/commentsskeleton";
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
import Getverified from "@/components/getverified";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    createdAt: string;
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
    isVerified: boolean;
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
  const [isBioUpdating, setIsBioUpdating] = useState(false);
  const [isOccupationUpdating, setIsOccupationUpdating] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({ content: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [isOverLimit, setIsOverLimit] = useState<boolean>(false);
  const [isUnderLimit, setIsUnderLimit] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openBioDialog, setOpenBioDialog] = useState<boolean>(false);
  const [openOccupationDialog, setOpenOccupationDialog] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<{ [key: string]: boolean }>({});
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<string | null>(null);
  const [tempBio, setTempBio] = useState(userBio);
  const [userOccupation, setUserOccupation] = useState<string>("");
  const [tempOccupation, setTempOccupation] = useState(userOccupation);
  const [userVerified, setUserVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        const postsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/myposts`);

        const userDetailsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/userdetails/${session.user.id}`
        );

        const postsWithComments = await Promise.all(
          postsResponse.data.map(async (post: Post) => {
            try {
              const commentsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/allposts/${post.id}/comments`
              );
              return { ...post, comments: commentsResponse.data };
            } catch (error) {
              console.error("Error fetching comments for post:", post.id, error);
              return { ...post, comments: [] };
            }
          })
        );

        setPosts(postsWithComments);
        setUserCreatedAt(userDetailsResponse.data.createdAt);
        setUserVerified(userDetailsResponse.data.isVerified);
        setUserBio(userDetailsResponse.data.bio);
        setUserOccupation(userDetailsResponse.data.occupation);
      } catch (error) {
        setError(`Something went wrong, please try again.`);
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        toast({
          description: "Post updated successfully!"
        })
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

  const handleBioUpdate = async (newBio: string | null) => {
    if (!session?.user.id) return;

    setIsBioUpdating(true);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/updatebio`,
        { bio: newBio, userId: session.user.id }
      );

      if (response.status === 200) {
        toast({
          description: "Bio updated successfully!"
        })
        setUserBio(newBio);
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    } finally {
      setOpenBioDialog(false);
      setIsBioUpdating(false);
    }
  };


  const handleOccupationUpdate = async (newOccupation: string) => {
    if (!session?.user.id) return;

    setIsOccupationUpdating(true);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/updateoccupation`,
        { occupation: newOccupation, userId: session.user.id }
      );

      if (response.status === 200) {
        toast({
          description: "Occupation updated successfully!"
        })
        setUserOccupation(newOccupation);
      }
    } catch (error) {
      console.error("Error updating occupation:", error);
    } finally {
      setOpenOccupationDialog(false);
      setIsOccupationUpdating(false);
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
        <div>
          <div className="flex flex-col gap-3 max-w-fit ml-2 mb-6">
            <Image
              width={500}
              height={500}
              priority
              quality={95}
              src={session?.user.image || "/pfp.png"}
              alt={"pfp.png"}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            /><div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-lg truncate">{session?.user.name}</p>
                    {userVerified ? (<MdVerified size={16} fill="#1D9BF0" />) : (
                      <Getverified />
                    )}
                  </div>
                  <p className="font-medium text-sm truncate text-neutral-500 -mt-1">@{session?.user.name?.toLowerCase().replace(/\s+/g, "")}
                  </p>
                  <p className="text-neutral-500 truncate text-sm flex items-center gap-1 mt-1 -mb-1 ml-[2px]">Bio :</p>
                  <div className="text-black dark:text-white truncate text-sm flex items-center justify-between gap-1 mt-2 mb-1 px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700">
                    {userBio ? (
                      <div className="flex items-center justify-between gap-2 min-w-full">
                        <p className="text-black dark:text-white truncate text-wrap text-sm max-w-[90%]">
                          {userBio}
                        </p>
                        <Pencil
                          className="h-4 w-4 cursor-pointer hover:text-zinc-500"
                          onClick={() => setOpenBioDialog(true)}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-neutral-500 truncate text-sm">
                          Add Bio
                        </p>
                        <Pencil
                          className="h-4 w-4 cursor-pointer hover:text-gray-500"
                          onClick={() => setOpenBioDialog(true)}
                        />
                      </>
                    )}
                  </div>
                  {/*  */}
                  <p className="text-neutral-500 truncate text-sm flex items-center gap-1 mt-1 -mb-1 ml-[2px]">Occupation :</p>
                  <div className="text-black dark:text-white truncate text-sm flex items-center justify-between gap-1 mt-2 mb-1 px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-700">
                    <div className="flex items-center justify-between gap-2 min-w-full">
                      <p className="text-black dark:text-white truncate text-wrap text-sm max-w-[90%]">
                        {userOccupation}
                      </p>
                      <Pencil
                        className="h-4 w-4 cursor-pointer hover:text-zinc-500"
                        onClick={() => setOpenOccupationDialog(true)}
                      />
                    </div>
                  </div>
                  {/*  */}
                  <p className="text-neutral-500 truncate text-sm flex items-center gap-1 mt-1">
                    <CalendarDays className="h-4 w-4" />Joined {userCreatedAt ? format(new Date(userCreatedAt), "MMMM dd, yyyy") : "Date not available"}
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
                              {799 - charCount} characters remaining
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
                  {post.comments && post.comments.length > 0 ? (<div className="font-semibold truncate mb-2">Comments</div>
                  ) : (<span></span>)}
                  {commentsLoading[post.id] ? (
                    <div><Commentskeleton count={2} /></div>
                  ) : post.comments && post.comments.length > 0 ? (
                    (post.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3 py-2">
                        <Image
                          width={500}
                          height={500}
                          src={comment.user.image || "/pfp.png"}
                          alt={comment.user.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm truncate">
                            <p className="font-bold flex items-center gap-1 truncate hover:underline">{comment.user.name}
                              {comment.user.isVerified && <MdVerified size={13} fill="#1D9BF0" className="mt-[2px]" />}
                            </p>
                            <span className="hidden sm:block text-neutral-500">·</span>
                            <span className="text-neutral-500 -mt-2 sm:mt-0 text-[0.75rem] truncate">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <div className="flex gap-1 items-center justify-between">
                            <p className="text-[0.85rem] text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap break-words overflow-hidden">
                              {comment.content}
                            </p>
                            <button
                              onClick={() => handleDeleteComment(comment.id, post.id)}
                              className="text-xs text-red-500 hover:text-red-700 border p-1 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) :
                    <div className="text-neutral-500 text-sm text-center py-4">
                      No comments available.
                    </div>
                  }
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
      {/* // */}
      <Dialog open={openBioDialog} onOpenChange={setOpenBioDialog}>
        <DialogContent className="sm:max-w-[425px] sm:top-1/2 sm:-translate-y-1/2 top-40">
          <DialogHeader>
            <DialogTitle>{userBio ? "Edit Your Bio" : "Add a Bio"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userBio" className="text-right">
                Bio
              </Label>
              <Input
                id="userBio"
                value={tempBio || ""}
                onChange={(e) => setTempBio(e.target.value)}
                maxLength={149}
                placeholder="Tell something about yourself..."
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter2 className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setTempBio(userBio);
                setOpenBioDialog(false)
                setIsBioUpdating(false)
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleBioUpdate(tempBio)
              }}
            >
              {isBioUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter2>
        </DialogContent>
      </Dialog>
      {/*  */}
      <Dialog open={openOccupationDialog} onOpenChange={setOpenOccupationDialog}>
        <DialogContent className="sm:max-w-[425px] sm:top-1/2 sm:-translate-y-1/2 top-40">
          <DialogHeader>
            <DialogTitle>Edit Your Occupation</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userOccupation" className="text-right">
                Occupation
              </Label>
              <Input
                id="userOccupation"
                value={tempOccupation || ""}
                onChange={(e) => setTempOccupation(e.target.value)}
                maxLength={29}
                minLength={1}
                placeholder="Add your Occupation..."
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter2 className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setTempOccupation(userOccupation);
                setOpenOccupationDialog(false)
                setIsOccupationUpdating(false)
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleOccupationUpdate(tempOccupation)
              }}
              disabled={!tempOccupation || tempOccupation.trim().length < 1}
            >
              {isOccupationUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter2>
        </DialogContent>
      </Dialog>
      {/*  */}
    </div>
  );
};

export default Myposts;
