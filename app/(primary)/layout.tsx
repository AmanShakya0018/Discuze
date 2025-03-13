import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import SideBar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import MobileNav from "@/components/mobilenav";
import Footer from "@/components/footer";
import { SuggestedUsers } from "@/components/suggestedusers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className={cn("relative flex min-h-dvh flex-col max-w-[84rem] mx-auto")}>
        <div className="flex flex-row">
          <aside className="hidden md:sticky md:top-0 pl-8 md:overflow-hidden md:block md:w-[280px] md:max-w-[280px] md:min-w-[280px] h-screen border-r border-neutral-200 dark:border-neutral-800">
            <div className="h-full w-full pr-2 py-2">
              <div className="h-full flex flex-col w-full gap-4 py-2">
                <SideBar />
              </div>
            </div>
          </aside>
          <main className="flex-1 px-4">{children}</main>
          <aside className="hidden lg:sticky lg:top-0 lg:overflow-hidden lg:block h-screen lg:w-[360px] lg:max-w-[360px] lg:min-w-[360px] py-8 px-4 border-l border-neutral-200 dark:border-neutral-800">
            <SuggestedUsers />
          </aside>
        </div>
        <Toaster />
      </div>
      <MobileNav />
      <Footer />
    </>
  );
}