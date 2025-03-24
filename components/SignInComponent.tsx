'use client'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [signinLoading, setSigninLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  const handleSignIn = async () => {
    setSigninLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Failed to sign in:', error);
      setSigninLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreateAccount(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Failed to sign in:', error);
      setCreateAccount(false);
    }
  };

  return (
    <div className='min-h screen'>
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:flex md:w-1/2 bg-emerald-500 items-center justify-center p-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">Happening now</h1>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                <span className="text-xl">Join the conversation</span>
              </div>
              <div className="flex items-center space-x-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                <span className="text-xl">Share your thoughts</span>
              </div>
              <div className="flex items-center space-x-4 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                <span className="text-xl">Connect globally</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <Image src="/discuzelogo.png" width={500} height={500} alt="logo" className='h-12 w-12' />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">See what&apos;s happening</h2>
              <p className="mt-2 text-sm text-muted-foreground">Join Discuze today.</p>
            </div>
            <div className="space-y-4">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 w-full"
                onClick={handleCreateAccount}
                disabled={createAccount}
              >
                {createAccount ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-foreground border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 rounded-md px-8 w-full"
                onClick={handleSignIn}
                disabled={signinLoading}
              >
                {signinLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              By signing up, you agree to the <Link className='underline' href="/termsofservice" target='_blank'>Terms of Service</Link> and <Link className='underline' href="/privacypolicy" target='_blank'>Privacy Policy.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
