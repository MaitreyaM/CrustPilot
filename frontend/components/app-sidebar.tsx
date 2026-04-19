"use client";

import { BookmarkPlus, Search } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  activeView: "people-search" | "saved-leads";
  savedLeadsCount: number;
  onChangeView: (view: "people-search" | "saved-leads") => void;
};

function SidebarBrand() {
  const { open } = useSidebar();
  return (
    <div className="flex items-center gap-2.5">
      <img
        alt="CrustPilot"
        className="size-7 shrink-0 brightness-0 invert"
        src="/crustpilot.svg"
      />
      {open ? (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-neutral-100">
            CrustPilot
          </div>
          <div className="truncate text-[11px] text-neutral-500">
            People search
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  activeView,
  savedLeadsCount,
  onChangeView,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === "people-search"}
                onClick={() => onChangeView("people-search")}
                title="People Search"
              >
                <Search />
                <span>People Search</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === "saved-leads"}
                onClick={() => onChangeView("saved-leads")}
                title="Saved Leads"
              >
                <BookmarkPlus />
                <span>Saved Leads</span>
                <SidebarMenuBadge>{savedLeadsCount}</SidebarMenuBadge>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
