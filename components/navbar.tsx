'use client'
import React from 'react';
import { Themetoggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import SignInButton from './SignInButton';
import { useSession } from 'next-auth/react';
import UserAccountNavMobile from './UserAccountNavMobile';


const Navbar = () => {

  const { data: session } = useSession();

  return (
    <nav className="block md:hidden z-50 sticky top-0 w-full bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border-b border-primary/10 px-4 lg:px-8
">
      <div className="max-w-[88rem] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className='flex items-center space-x-12'>
            <Link href="/" className="flex items-center">
              <Image
                width={500}
                height={500}
                src="/discuzelogo.png"
                alt="discuzelogo.png"
                quality={100}
                priority={true}
                className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
              />
              <h3 className="text-2xl font-bold">Discuze</h3>
            </Link>

          </div>

          <div className="md:hidden flex items-center space-x-1">
            <Themetoggle />
            {session?.user ? (
              <UserAccountNavMobile user={session.user} />
            ) : (
              <SignInButton text={"Sign In"} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;