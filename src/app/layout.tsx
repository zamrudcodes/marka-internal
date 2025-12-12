import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser, getUserFeatures } from "@/app/auth/actions";
import { type UserRole } from "@/lib/auth/permissions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marka Internal",
  description: "Manage employees and projects for bonus calculation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user data on the server
  const currentUser = await getCurrentUser();

  // Get user features if user is authenticated
  // Fallback to empty array if feature table doesn't exist yet
  let userFeatures: any[] = [];
  if (currentUser) {
    try {
      userFeatures = await getUserFeatures(currentUser.id);
    } catch (error) {
      console.warn('Could not fetch user features, using empty array:', error);
      userFeatures = [];
    }
  }

  const userData = currentUser ? {
    name: currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || '',
    avatar: "/avatars/shadcn.jpg",
    role: currentUser.role,
    features: userFeatures,
  } : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" userData={userData} />
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <SiteHeader />
            <main className="flex-1 overflow-hidden">{children}</main>
            <Toaster position="top-center" closeButton />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
