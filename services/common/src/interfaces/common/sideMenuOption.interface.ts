import { ReactNode } from "react";

export interface ISideMenuOption {
  href: string;
  title: string;
  icon?: ReactNode;
  description?: string;
}
