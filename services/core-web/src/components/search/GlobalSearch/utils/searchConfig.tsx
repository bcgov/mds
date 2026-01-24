import React from "react";
import {
  EnvironmentOutlined,
  UserOutlined,
  BankOutlined,
  FileProtectOutlined,
  AlertOutlined,
  FileSearchOutlined,
  ExceptionOutlined,
  AimOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

export interface SearchTypeConfig {
  icon: React.ReactNode;
  label: string;
  pluralLabel: string;
  color: string;
  types: string[];
}

export const SEARCH_TYPE_CONFIG: Record<string, SearchTypeConfig> = {
  mine: {
    icon: <EnvironmentOutlined />,
    label: "Mine",
    pluralLabel: "Mines",
    color: "#2e7d32",
    types: ["mine"],
  },
  contact: {
    icon: <UserOutlined />,
    label: "Person",
    pluralLabel: "People",
    color: "#1565c0",
    types: ["person", "party"],
  },
  organization: {
    icon: <BankOutlined />,
    label: "Organization",
    pluralLabel: "Organizations",
    color: "#f57c00",
    types: ["organization"],
  },
  permit: {
    icon: <FileProtectOutlined />,
    label: "Permit",
    pluralLabel: "Permits",
    color: "#e65100",
    types: ["permit"],
  },
  explosives_permit: {
    icon: <AlertOutlined />,
    label: "Explosives Permit",
    pluralLabel: "Explosives",
    color: "#d32f2f",
    types: ["explosives_permit"],
  },
  now_application: {
    icon: <FileSearchOutlined />,
    label: "Notice of Work",
    pluralLabel: "NoW",
    color: "#0288d1",
    types: ["now_application"],
  },
  nod: {
    icon: <ExceptionOutlined />,
    label: "NOD",
    pluralLabel: "NODs",
    color: "#7b1fa2",
    types: ["nod", "notice_of_departure"],
  },
  document: {
    icon: <FileSearchOutlined />,
    label: "Document",
    pluralLabel: "Documents",
    color: "#455a64",
    types: ["mine_documents", "permit_documents"],
  },
};

// Mapping for individual result types (more specific than filter types)
export const RESULT_TYPE_MAP: Record<string, keyof typeof SEARCH_TYPE_CONFIG> = {
  mine: "mine",
  person: "contact",
  party: "contact",
  organization: "organization",
  permit: "permit",
  explosives_permit: "explosives_permit",
  now_application: "now_application",
  nod: "nod",
  notice_of_departure: "nod",
  mine_documents: "document",
  permit_documents: "document",
};

export const RECENT_SEARCHES_KEY = "mds_recent_searches";
export const MAX_RECENT_SEARCHES = 5;
