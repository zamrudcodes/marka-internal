"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconUsers,
  IconCalculator,
  IconBuilding,
  IconAd,
  IconFileText,
  IconUserCog,
  IconBriefcase,
} from "@tabler/icons-react";

import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { canAccessRoute, type UserRole, type FeatureKey, ROUTE_TO_FEATURE } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/app/auth/actions";

// All available navigation items
const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Employees",
    url: "/employees",
    icon: IconUsers,
  },
  {
    title: "Departments",
    url: "/departments",
    icon: IconBuilding,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: IconFolder,
    items: [
      {
        title: "All Projects",
        url: "/projects",
      },
      {
        title: "Project Health Heatmap",
        url: "/projects/heatmap",
      },
    ],
  },
  {
    title: "Project Charters",
    url: "/project-charters",
    icon: IconFileText,
  },
  {
    title: "Commercial",
    url: "/commercial",
    icon: IconBriefcase,
    items: [
      {
        title: "New Project Intake",
        url: "/commercial/new-project-intake",
      },
      {
        title: "Project Briefs",
        url: "/commercial/project-briefs",
      },
    ],
  },
  {
    title: "Bonus Periods",
    url: "/bonus-periods",
    icon: IconChartBar,
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: IconCalculator,
  },
  {
    title: "Ads Performance",
    url: "/ads-performance",
    icon: IconAd,
  },
  {
    title: "User Management",
    url: "/users",
    icon: IconUserCog,
  },
];

// Filter navigation items based on user's enabled features
function filterNavItems(items: NavItem[], userFeatures: FeatureKey[]): NavItem[] {
  if (!userFeatures || userFeatures.length === 0) return [];

  return items.filter(item => {
    // Check if user has access to this item
    if (!canAccessRoute(userFeatures, item.url)) {
      return false;
    }

    // If item has sub-items, filter them too
    if (item.items && item.items.length > 0) {
      item.items = item.items.filter(subItem =>
        canAccessRoute(userFeatures, subItem.url)
      );
    }

    return true;
  });
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userData?: {
    name: string;
    email: string;
    avatar: string;
    role: UserRole | null;
    features?: FeatureKey[];
  } | null;
}

export function AppSidebar({ userData, ...props }: AppSidebarProps) {
  // Filter navigation items based on user's enabled features
  const navItems = userData?.features ? filterNavItems(allNavItems, userData.features) : [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <span className="text-base font-semibold">Marka Internal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {userData && <NavUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  );
}
