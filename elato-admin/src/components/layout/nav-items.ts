import type { ComponentType } from "react";
import {
  LayoutDashboard,
  BarChart3,
  FolderTree,
  UtensilsCrossed,
  Sparkles,
  PartyPopper,
  BedDouble,
  Images,
  Star,
  Camera,
  FileText,
  Settings as SettingsIcon,
  Users,
  Inbox,
  Library,
} from "lucide-react";
import type { AdminRole } from "../../types/api";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: AdminRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/specials", label: "Specials", icon: Sparkles },
  { to: "/events", label: "Events", icon: PartyPopper },
  { to: "/stay", label: "Stay", icon: BedDouble },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/instagram", label: "Instagram", icon: Camera },
  { to: "/homepage", label: "Homepage", icon: FileText },
  { to: "/media", label: "Media Library", icon: Library },
  { to: "/settings", label: "Settings", icon: SettingsIcon, roles: ["owner", "admin"] },
  { to: "/users", label: "Users", icon: Users, roles: ["owner", "admin"] },
];
