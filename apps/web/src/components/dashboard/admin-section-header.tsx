"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSectionHeaderProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryActions?: React.ReactNode;
  className?: string;
}

export function AdminSectionHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
  className,
}: AdminSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {secondaryActions}
        {primaryAction && (
          <Button onClick={primaryAction.onClick} size="lg">
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
