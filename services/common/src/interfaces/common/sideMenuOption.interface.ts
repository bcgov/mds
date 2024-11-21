import { ReactNode } from "react";

export interface ISideMenuOption {
  href: string;
  title: string | ReactNode;
  icon?: ReactNode;
  description?: string | ReactNode;
}
