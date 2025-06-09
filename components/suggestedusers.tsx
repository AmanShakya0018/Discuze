"use client"
import Image from "next/image";
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MdVerified } from "react-icons/md";
import { BiLinkExternal } from "react-icons/bi"

const suggestedUsers = [
  {
    id: "1",
    name: "Aman Shakya",
    username: "amanshakya",
    isVerified: true,
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocIZsRJfYmQRm1mw6mG8tGz_tlpf7eub8LcZOy0jHFyzFCLeIQ=s96-c",
    link: "/profile/a7a7f012-d874-4c55-89e2-ec2468dfb19a"
  },
  {
    id: "2",
    name: "Arun Prajapati",
    username: "arunprajapati",
    isVerified: true,
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocIxLPfRvt2dcUdK7xfJA5xW7Mw3bx3c7tZV3HnHV7dC8s961Djb=s96-c",
    link: "/profile/8cff3558-5103-4a25-8810-911a26226ca8"
  },
  {
    id: "3",
    name: "John Snow",
    username: "johnsnow",
    isVerified: false,
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocIfXkcoq6wz2K80bXoy9Zj3dpjp_G9ap48GEtZPVY-pxo2SYA=s96-c",
    link: "/profile/8bc4ac17-0976-48f5-9250-fe4dfdc680a8"
  },
]

export function SuggestedUsers() {

  return (
    <Card className="border rounded-xl shadow-none border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Suggested Users</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-2">
          {suggestedUsers.map((user) => (
            <Link
              href={user.link} target="_blank"
              key={user.id}
              className="flex items-center justify-between px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors"
            >
              <div className="flex gap-3">
                <div >
                  <Image
                    width={500}
                    height={500}
                    src={user.avatar}
                    alt={"pfp"}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                </div>
                <div className="flex items-start flex-col">
                  <div className="text-[0.95rem] flex items-center gap-1 font-semibold hover:underline">
                    {user.name}
                    {user.isVerified && <MdVerified size={14} fill="#1D9BF0" />}
                  </div>
                  <div className="text-sm text-neutral-500 -mt-1">@{user.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full font-semibold px-3 py-2 text-zinc-500 dark:text-zinc-400"
                >
                  <BiLinkExternal size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/search" className="mt-4 block text-neutral-600 dark:text-neutral-400 hover:underline text-sm pl-3">
          Show more
        </Link>
      </CardContent>
    </Card>
  )
}

