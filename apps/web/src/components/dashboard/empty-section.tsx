"use client";

import {
  Users,
  CreditCard,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";
// import { AdminSectionHeader } from "@/components/dashboard/admin-section-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card } from "@/components/ui/card";
import type { AdminSection } from "./admin-sidebar";

const sections: Record<
  AdminSection,
  {
    icon: typeof Users;
    emptyTitle: string;
    emptyDescription: string;
    emptyActionLabel: string;
  }
> = {
  users: {
    icon: Users,
    emptyTitle: "Nessun utente trovato",
    emptyDescription:
      "Invita il primo utente per iniziare a gestire la piattaforma.",
    emptyActionLabel: "Invita Utente",
  },
  subscriptions: {
    icon: CreditCard,
    emptyTitle: "Nessun abbonamento attivo",
    emptyDescription: "Crea il primo piano di abbonamento per iniziare.",
    emptyActionLabel: "Crea Piano",
  },
  lessons: {
    icon: BookOpen,
    emptyTitle: "Nessuna lezione programmata",
    emptyDescription:
      "Crea la prima lezione per iniziare a organizzare il calendario.",
    emptyActionLabel: "Crea Lezione",
  },
  events: {
    icon: Calendar,
    emptyTitle: "Nessun evento in programma",
    emptyDescription:
      "Crea il primo evento per iniziare a promuovere la tua attività.",
    emptyActionLabel: "Crea Evento",
  },
  teachers: {
    icon: GraduationCap,
    emptyTitle: "Nessun insegnante registrato",
    emptyDescription:
      "Aggiungi il primo insegnante per iniziare a gestire il team.",
    emptyActionLabel: "Aggiungi Insegnante",
  },
};

interface AdminSectionContentProps {
  section: AdminSection;
}

export function AdminSectionContent({ section }: AdminSectionContentProps) {
  const currentSection = sections[section];
  const SectionIcon = currentSection.icon;

  const handleEmptyAction = () => {
    // Placeholder per future implementazioni
    console.log(`Action clicked for ${section}`);
  };

  return (
    <Card className="">
      <EmptyState
        icon={SectionIcon}
        title={currentSection.emptyTitle}
        description={currentSection.emptyDescription}
        actionLabel={currentSection.emptyActionLabel}
        onAction={handleEmptyAction}
      />
    </Card>
  );
}
