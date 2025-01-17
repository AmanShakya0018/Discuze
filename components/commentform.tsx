'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

export function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState('')
  const router = useRouter();

  const handleClick = async () => {
    if (!comment) {
      alert("Comment content is required")
      return
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          postId,
          content: comment,
        }
      )

      if (response.data.success) {
        alert("Comment added successfully!")
        setComment('')
        router.refresh();
      } else {
        alert(response.data.message || "Failed to add comment")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("An error occurred while adding the comment.")
    }
  }

  return (
    <div className="mt-4">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
      />
      <button
        onClick={handleClick}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Comment
      </button>
    </div>
  )
}
