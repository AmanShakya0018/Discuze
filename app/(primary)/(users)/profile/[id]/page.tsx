"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface User {
  id: string;
  name: string;
  image?: string;
  email: string;
  createdAt: string;
  Post: { id: string; content: string; createdAt: string }[];
}

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">User not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4">
        {/* {user.image && <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full" />} */}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-6">Posts</h2>
      {user.Post.length > 0 ? (
        <div className="mt-4 space-y-4">
          {user.Post.map((post) => (
            <div key={post.id} className="p-4 bg-white shadow rounded-md">
              <p className="text-gray-600">{post.content}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No posts found.</p>
      )}
    </div>
  );
}
