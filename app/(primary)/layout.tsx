import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import SideBar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import MobileNav from "@/components/mobilenav";
import Footer from "@/components/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className={cn("relative flex min-h-dvh flex-col max-w-7xl mx-auto")}>
        <div className="flex flex-row">
          <aside className="hidden md:sticky md:top-0 md:overflow-hidden md:block md:w-[240px] md:max-w-[240px] md:min-w-[240px] h-screen border-r border-neutral-200 dark:border-neutral-800">
            <div className="h-full w-full pr-2 py-2">
              <div className="h-full flex flex-col w-full gap-4 py-2">
                <SideBar />
              </div>
            </div>
          </aside>
          <main className="flex-1 px-6">{children}</main>
          <aside className="hidden lg:block w-40 p-6"></aside>
        </div>
        <Toaster />
      </div>
      <MobileNav />
      <Footer />
    </>
  );
}