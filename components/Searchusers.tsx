"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { debounce } from "lodash";
import { Spinner } from "./ui/spinner";
import { MdVerified } from "react-icons/md";

interface User {
  id: string;
  name: string;
  username: string;
  image: string | null;
  isVerified: boolean;
}

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setNoResults(false);
      return;
    }

    const fetchUsers = debounce(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/searchusers?query=${query}`);
        const data = await res.json();
        setUsers(data.users || []);
        setNoResults(data.users.length === 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        setNoResults(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    fetchUsers();
    return () => fetchUsers.cancel();
  }, [query]);

  return (
    <div className="relative w-full">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 rounded-2xl"
      />
      {loading && (
        <div className="flex pt-4 items-center justify-center">
          <Spinner size="small" />
        </div>
      )}
      {query && (
        <div className="absolute top-full mt-2 w-full rounded-md">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id}>
                <Link
                  href={`/profile/${user.id}`}
                  target="_blank"
                  className="flex items-center p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || "/pfp.png"} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="text-sm flex items-center gap-[2px] text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
                      {user.name}
                      {user.isVerified && <MdVerified size={12} fill="#1D9BF0" />}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{user.name?.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>
                </Link>
                <div className="border-b border-y-1 rounded-lg border-slate-300 dark:border-neutral-700 mx-2"></div>
              </div>
            ))
          ) : noResults && !loading ? (
            <div className="p-4 text-center text-zinc-500">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
