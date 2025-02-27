"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { debounce } from "lodash";

interface User {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = debounce(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/searchusers?query=${query}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    fetchUsers();
    return () => fetchUsers.cancel();
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2"
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
      {query && users.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-md shadow-md">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`} // Adjust based on routing
              className="flex items-center p-2 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || "/default-avatar.png"} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm text-black font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
