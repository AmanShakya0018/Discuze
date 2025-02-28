"use client"
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Home, Search, User2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import UserAccountNav from './UserAccountNav'
import SignInButton from './SignInButton'
import { useTheme } from 'next-themes'

const SideBar = () => {
  const { data: session } = useSession()
  const { theme } = useTheme()

  let image = '/discuzelogo.png';

  if (theme === 'light') {
    image = '/discuzelogolight.png';
  }


  return (
    <div className='flex flex-col justify-between gap-2 p-2 min-h-screen relative'>
      <div>
        <Link href="/" className="flex items-center">
          <Image
            width={500}
            height={500}
            src={image}
            alt="discuzelogo.png"
            quality={100}
            priority={true}
            className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
          />
          <h3 className="text-2xl font-bold">Discuze</h3>
        </Link>
        <div className='flex flex-col gap-4 mt-6 w-full'>
          <Link
            href="/"
            className='flex justify-start items-center rounded-xl dark:hover:bg-neutral-900 hover:bg-neutral-100 max-w-full p-2'
          >
            <Home className="text-2xl " height={25} width={25} />
            <h3 className="text-lg lg:text-xl ml-2">Home</h3>
          </Link>
          <Link
            href="/profile"
            className='flex justify-start items-center rounded-xl dark:hover:bg-neutral-900 hover:bg-neutral-100 max-w-full p-2'>
            <User2 className="text-2xl" height={25} width={25} />
            <h3 className="text-lg lg:text-xl  ml-2">Profile</h3>
          </Link>
          <Link
            href="/search"
            className='flex justify-start items-center rounded-xl dark:hover:bg-neutral-900 hover:bg-neutral-100 max-w-full p-2'>
            <Search className="text-2xl" height={25} width={25} />
            <h3 className="text-lg lg:text-xl  ml-2">Search</h3>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-[22rem] p-2 absolute bottom-6">
        {session?.user ? (
          <div className='flex flex-row gap-2'>
            <UserAccountNav user={session.user} />
            {/* <div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">{session?.user.name}</p>
              <p className="w-[200px] truncate text-xs text-zinc-700 dark:text-zinc-300">@{session?.user.name?.toLowerCase().replace(/\s+/g, "")}</p>
            </div> */}
          </div>
        ) : (
          <SignInButton text={"Sign In"} />
        )}
      </div>
    </div>
  )
}

export default SideBar