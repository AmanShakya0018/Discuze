import Link from 'next/link'
import React from 'react'
import { Home, User2 } from 'lucide-react'

const MobileNav = () => {

  return (
    <div className="md:hidden block sticky -bottom-[2px] border-t border-neutral-100 dark:border-white/[0.1] bg-white/50 dark:bg-black/50 shadow-lg shadow-neutral-600/5 backdrop-blur-lg">
      <div className="max-w-[80remrem] mx-auto text-sm text-gray-400 flex flex-row justify-between items-start ">
        <Link href="/" className="flex flex-col items-center justify-center border-r border-neutral-100 dark:border-white/[0.1] text-center text-neutral-500 w-1/2 h-12">
          <Home className='w-7 h-7' />
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center border-l border-neutral-100 dark:border-white/[0.1] text-center text-neutral-500 w-1/2 h-12">
          <User2 className='w-7 h-7' />
        </Link>
      </div>
    </div>
  )
}

export default MobileNav