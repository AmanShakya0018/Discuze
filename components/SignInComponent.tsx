'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen max-w-[88rem] mx-auto">
      <div className="w-full flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground">
                Sign in to your account to continue
              </p>
              <Button
                className="w-full gap-2 font-semibold"
                variant="outline"
                onClick={() => {
                  signIn("google", { callbackUrl: "/" });
                }}
              >
                <Image src="/google.png" width={22} height={22} alt="google" />
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

