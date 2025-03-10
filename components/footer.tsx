"use client"
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const Footer = () => {
  const { theme } = useTheme()

  let image = '/discuzelogo.png';

  if (theme === 'light') {
    image = '/discuzelogolight.png';
  }

  return (
    <div className="hidden md:block border-t border-neutral-100 dark:border-white/[0.1] px-8 py-20 bg-white dark:bg-black">
      <div className="max-w-[80rem] mx-auto text-sm px-4 text-gray-400 flex sm:flex-row flex-col justify-between items-start ">
        <div>
          <div className="mb-4 flex">
            <Link href="/" className="flex items-center">
              <Image
                width={500}
                height={500}
                src={image}
                alt="discuzelogo.png"
                quality={100}
                priority={true}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <span className="text-2xl font-extrabold text-black dark:text-white ">Discuze</span>
            </Link>
          </div>
          <div className="mt-2">
            Building in public at
            <a className="dark:text-emerald-500 pl-1 font-medium text-neutral-600" target="__blank" href="https://github.com/amanshakya0018">@amanshakya0018</a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-10 items-start mt-10 md:mt-0">
          <div className="flex justify-center space-y-4 flex-col mt-4">
            <Link href='/'>
              <p className="hover:text-foreground/80 text-foreground/60">Home</p>
            </Link>
            <Link href='/profile'>
              <p className="hover:text-foreground/80 text-foreground/60">Profile</p>
            </Link>
            <Link href='/search'>
              <p className="hover:text-foreground/80 text-foreground/60">Search</p>
            </Link>
          </div>
          <div className="flex justify-center space-y-4 flex-col mt-4">
            <Link href='https://x.com/AmanShakya0018' target="_blank">
              <p className="hover:text-foreground/80 text-foreground/60">Twitter</p>
            </Link>
            <Link href='https://www.linkedin.com/in/amanshakya0018/' target='_blank'>
              <p className="hover:text-foreground/80 text-foreground/60">LindedIn</p>
            </Link>
          </div>
          <div className="flex justify-center space-y-4 flex-col mt-4">
            <p className="hover:text-foreground/80 text-foreground/60"><a href='/termsofservice' target='_blank'>Terms of Service</a></p>
            <p className="hover:text-foreground/80 text-foreground/60"><a href='/privacypolicy' target='_blank'>Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer