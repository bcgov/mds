import React from "react";
import {
  EnvironmentOutlined,
  UserOutlined,
  FileProtectOutlined,
  AlertOutlined,
  FileSearchOutlined,
  ExceptionOutlined,
} from "@ant-design/icons";

export interface FacetBucket {
  key: string;
  count: number;
  meta?: any;
}

export interface FacetGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  facets: string[];
}

export const FACET_GROUPS: FacetGroup[] = [
  {
    key: "mine",
    label: "Mine Filters",
    icon: React.createElement(EnvironmentOutlined),
    color: "#2e7d32",
    facets: ["mine_region", "mine_classification", "mine_operation_status", "mine_tenure", "mine_commodity", "has_tsf", "verified_status"]
  },
  {
    key: "permit",
    label: "Permit Filters",
    icon: React.createElement(FileProtectOutlined),
    color: "#e65100",
    facets: ["permit_status", "is_exploration"]
  },
  {
    key: "party",
    label: "Contact Filters",
    icon: React.createElement(UserOutlined),
    color: "#1565c0",
    facets: ["party_type"]
  },
  {
    key: "explosives_permit",
    label: "Explosives Filters",
    icon: React.createElement(AlertOutlined),
    color: "#d32f2f",
    facets: ["explosives_permit_status", "explosives_permit_closed"]
  },
  {
    key: "now_application",
    label: "NoW Filters",
    icon: React.createElement(FileSearchOutlined),
    color: "#0288d1",
    facets: ["now_application_status", "now_type", "artifact_type", "artifact_page_number"]
  },
  {
    key: "nod",
    label: "NOD Filters",
    icon: React.createElement(ExceptionOutlined),
    color: "#7b1fa2",
    facets: ["nod_type", "nod_status"]
  },
];

export const FACET_LABELS: Record<string, string> = {
  mine_region: "Region",
  mine_classification: "Classification",
  mine_operation_status: "Operation Status",
  mine_tenure: "Tenure Type",
  mine_commodity: "Commodity",
  has_tsf: "Tailings Storage Facility",
  verified_status: "Verification Status",
  permit_status: "Status",
  is_exploration: "Exploration",
  party_type: "Type",
  explosives_permit_status: "Status",
  explosives_permit_closed: "Status",
  nod_type: "Type",
  nod_status: "Status",
  now_application_status: "Status",
  now_type: "Type",
  artifact_type: "Artifact Type",
  artifact_page_number: "Artifact Page",
};

export interface SearchFacets {
  mine_region?: FacetBucket[];
  mine_classification?: FacetBucket[];
  mine_operation_status?: FacetBucket[];
  mine_tenure?: FacetBucket[];
  mine_commodity?: FacetBucket[];
  has_tsf?: FacetBucket[];
  verified_status?: FacetBucket[];
  permit_status?: FacetBucket[];
  is_exploration?: FacetBucket[];
  party_type?: FacetBucket[];
  explosives_permit_status?: FacetBucket[];
  explosives_permit_closed?: FacetBucket[];
  nod_type?: FacetBucket[];
  nod_status?: FacetBucket[];
  now_application_status?: FacetBucket[];
  now_type?: FacetBucket[];
  artifact_type?: FacetBucket[];
  artifact_page_number?: FacetBucket[];
  type?: FacetBucket[];
}
