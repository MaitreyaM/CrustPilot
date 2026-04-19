"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3.5rem";

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  state: "expanded" | "collapsed";
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar components must be used within SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const value = React.useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      toggleSidebar: () => setOpen((prev) => !prev),
      state: open ? "expanded" : "collapsed",
    }),
    [open],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        className="flex min-h-screen w-full text-neutral-200"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useSidebar();
  return (
    <aside
      className={cn(
        "relative z-30 hidden shrink-0 border-r border-white/5 bg-transparent backdrop-blur-xl transition-[width] duration-200 ease-linear lg:flex lg:flex-col",
        className,
      )}
      data-state={open ? "expanded" : "collapsed"}
      style={{
        width: open ? "var(--sidebar-width)" : "var(--sidebar-width-icon)",
      }}
    >
      {children}
    </aside>
  );
}

export function SidebarInset({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex min-h-screen flex-1 flex-col", className)}>
      {children}
    </div>
  );
}

export function SidebarHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center px-3 py-3", className)}>{children}</div>
  );
}

export function SidebarContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex-1 overflow-auto px-2 py-2", className)}>{children}</div>
  );
}

export function SidebarFooter({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cn("px-2 py-3", className)}>{children}</div>;
}

export function SidebarGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-1 py-2", className)}>{children}</div>;
}

export function SidebarGroupLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useSidebar();
  if (!open) return null;
  return (
    <div
      className={cn(
        "px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SidebarMenu({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("flex flex-col gap-0.5", className)}>{children}</div>;
}

export function SidebarMenuItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("", className)}>{children}</div>;
}

export function SidebarMenuButton({
  className,
  isActive,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
}) {
  const { open } = useSidebar();
  return (
    <button
      className={cn(
        "group/menu-button flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        isActive && "bg-white/8 text-neutral-50",
        !open && "justify-center px-0",
        className,
      )}
      data-active={isActive ? "true" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useSidebar();
  if (!open) return null;
  return (
    <span
      className={cn(
        "ml-auto rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      aria-label="Toggle sidebar"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-white/5 hover:text-neutral-100",
        className,
      )}
      onClick={toggleSidebar}
      type="button"
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

export function SidebarSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("mx-2 my-1 h-px bg-white/8", className)} />
  );
}
