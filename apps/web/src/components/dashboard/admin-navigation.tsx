"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  CreditCard,
  BookOpen,
  Calendar,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminSection } from "./admin-sidebar";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: typeof Users;
  href: string;
}

const navItems: NavItem[] = [
  { id: "users", label: "Utenti", icon: Users, href: "/dashboard/users" },
  {
    id: "subscriptions",
    label: "Abbonamenti",
    icon: CreditCard,
    href: "/dashboard/subscriptions",
  },
  {
    id: "lessons",
    label: "Lezioni",
    icon: BookOpen,
    href: "/dashboard/lessons",
  },
  { id: "events", label: "Eventi", icon: Calendar, href: "/dashboard/events" },
  {
    id: "teachers",
    label: "Insegnanti",
    icon: GraduationCap,
    href: "/dashboard/teachers",
  },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background"
        >
          {isMobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-transform duration-300 md:relative md:z-auto md:h-full",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">Dashboard Admin</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex ml-auto"
            >
              {isCollapsed ? (
                <Menu className="size-5" />
              ) : (
                <X className="size-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
