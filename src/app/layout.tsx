import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser, getUserFeatures } from "@/app/auth/actions";
import { type UserRole, ROLE_DEFAULT_FEATURES, type FeatureKey } from "@/lib/auth/permissions";

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
  // Merge DB features with role default features
  let userFeatures: FeatureKey[] = [];

  if (currentUser && currentUser.role) {
    // 1. Get default features for the role from code
    const defaultFeatures = ROLE_DEFAULT_FEATURES[currentUser.role] || [];

    // 2. Get additional enabled features from DB
    let dbFeatures: FeatureKey[] = [];
    try {
      // Cast the result to FeatureKey[] 
      dbFeatures = (await getUserFeatures(currentUser.id)) as FeatureKey[];
    } catch (error) {
      console.warn('Could not fetch user features, using defaults:', error);
    }

    // 3. Merge and deduplicate
    userFeatures = Array.from(new Set([...defaultFeatures, ...dbFeatures]));
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
            <main className="flex-1 overflow-auto">{children}</main>
            <Toaster position="top-center" closeButton />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
