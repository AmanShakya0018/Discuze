'use client'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function CommentForm({ postId }: { postId: string }) {
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const userId = session?.user?.id

  const handleClick = async () => {
    if (!comment) {
      alert('Comment content is required')
      return
    }
    if (!userId) {
      alert('You must be logged in to comment')
      return
    }
    setSubmittingComment(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments`,
        {
          postId,
          content: comment,
          userId,
        }
      )

      if (response.data.success) {
        alert('Comment added successfully!')
        setComment('')
        router.refresh()
      } else {
        alert(response.data.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('An error occurred while adding the comment.')
    } finally {
      setSubmittingComment(false)
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
        disabled={submittingComment}
      />
      <button
        onClick={handleClick}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
        disabled={submittingComment}
      >
        {submittingComment ? 'Submitting...' : 'Add Comment'}
      </button>
    </div>
  )
}
