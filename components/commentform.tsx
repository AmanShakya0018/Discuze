"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const userId = session?.user?.id

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!comment) {
      alert("Comment content is required")
      return
    }
    if (!userId) {
      alert("You must be logged in to comment")
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
        alert("Comment added successfully!")
        setComment("")
        setIsDialogOpen(false)
        router.refresh()
      } else {
        alert(response.data.message || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("An error occurred while adding the comment.")
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4">Add Comment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Comment</DialogTitle>
          <DialogDescription>Enter your comment below. Click submit when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
  )
}

