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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: typeof Users;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Utenti", icon: Users, href: "/dashboard/users" },
  {
    label: "Abbonamenti",
    icon: CreditCard,
    href: "/dashboard/subscriptions",
  },
  { label: "Lezioni", icon: BookOpen, href: "/dashboard/lessons" },
  { label: "Eventi", icon: Calendar, href: "/dashboard/events" },
  { label: "Insegnanti", icon: GraduationCap, href: "/dashboard/teachers" },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
