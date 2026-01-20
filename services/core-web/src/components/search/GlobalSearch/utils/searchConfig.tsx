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

export interface CommandConfig {
  action: string;
  description: string;
  aliases: string[];
  icon?: React.ReactNode;
}

export const COMMAND_CONFIG: Record<string, CommandConfig> = {
  mine: {
    action: "filter:mine",
    description: "Toggle Mines filter",
    aliases: ["mines", "m"],
    icon: <EnvironmentOutlined />,
  },
  contact: {
    action: "filter:contact",
    description: "Toggle People filter",
    aliases: ["contacts", "people", "person", "p"],
    icon: <UserOutlined />,
  },
  organization: {
    action: "filter:organization",
    description: "Toggle Organizations filter",
    aliases: ["organizations", "orgs", "org", "o"],
    icon: <BankOutlined />,
  },
  permit: {
    action: "filter:permit",
    description: "Toggle Permits filter",
    aliases: ["permits"],
    icon: <FileProtectOutlined />,
  },
  explosives: {
    action: "filter:explosives_permit",
    description: "Toggle Explosives filter",
    aliases: ["explosives_permit", "exp", "e"],
    icon: <AlertOutlined />,
  },
  now: {
    action: "filter:now_application",
    description: "Toggle Notice of Work filter",
    aliases: ["now_application", "notice", "work"],
    icon: <FileSearchOutlined />,
  },
  nod: {
    action: "filter:nod",
    description: "Toggle NODs filter",
    aliases: ["nods", "n"],
    icon: <ExceptionOutlined />,
  },
  document: {
    action: "filter:document",
    description: "Toggle Documents filter",
    aliases: ["documents", "docs", "doc", "d"],
    icon: <FileSearchOutlined />,
  },
  here: {
    action: "scope:mine",
    description: "Toggle scope to current mine",
    aliases: ["this", "scope"],
    icon: <AimOutlined />,
  },
  clear: {
    action: "clear:filters",
    description: "Clear all filters",
    aliases: ["reset", "c"],
    icon: <DeleteOutlined />,
  },
};

export const RECENT_SEARCHES_KEY = "mds_recent_searches";
export const MAX_RECENT_SEARCHES = 5;
