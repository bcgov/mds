import React from "react";
import { Tabs, Empty } from "antd";
import { MineResultsTable } from "./MineResultsTable";
import { PermitResultsTable } from "./PermitResultsTable";
import { ContactResultsTable } from "./ContactResultsTable";
import { DocumentResultsTable } from "./DocumentResultsTable";
import { GenericResultsTable } from "./GenericResultsTable";
import * as router from "@/constants/routes";

interface SearchResultsTabsProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  query: string;
  highlightRegex: RegExp | null;
  partyRelationshipTypeHash: any;
  results: {
    mines: any[];
    mineResults: any[];
    peopleResults: any[];
    organizationResults: any[];
    permitResults: any[];
    documentResults: any[];
    explosivesPermitResults: any[];
    explosivesPermits: any[];
    nowApplicationResults: any[];
    nowApplications: any[];
    nodResults: any[];
    nods: any[];
    totalResults: number;
    facetCounts: {
      mine: number;
      party: number;
      person: number;
      organization: number;
      permit: number;
      explosives_permit: number;
      now_application: number;
      notice_of_departure: number;
      mine_documents: number;
      permit_documents: number;
    };
  };
}

const renderEmptyState = () => (
  <Empty
    description={<span>No results in this category</span>}
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    className="search-results-v2__empty-state"
  />
);

export const SearchResultsTabs: React.FC<SearchResultsTabsProps> = ({
  activeTab,
  onTabChange,
  query,
  highlightRegex,
  partyRelationshipTypeHash,
  results,
}) => {
  const {
    mineResults,
    peopleResults,
    organizationResults,
    permitResults,
    documentResults,
    explosivesPermitResults,
    nowApplicationResults,
    nodResults,
    totalResults,
    facetCounts,
  } = results;

  const explosivesColumns = [
    { title: "Application #", dataIndex: "application_number", key: "application_number" },
    { title: "Status", dataIndex: "application_status", key: "application_status" },
    { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_PERMITS.dynamicRoute(record.mine_guid) },
    { title: "Closed", dataIndex: "is_closed", key: "is_closed", customRender: (text: boolean) => text ? "Yes" : "No" },
  ];

  const nowColumns = [
    { title: "NoW #", dataIndex: "now_number", key: "now_number", link: (record: any) => router.NOTICE_OF_WORK_APPLICATION.dynamicRoute(record.now_application_guid, "verification") },
    { title: "Status", dataIndex: "now_application_status_code", key: "status" },
    { title: "Type", dataIndex: "notice_of_work_type_code", key: "type" },
    { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
  ];

  const nodColumns = [
    { title: "NOD #", dataIndex: "nod_no", key: "nod_no", link: (record: any) => router.NOTICE_OF_DEPARTURE.dynamicRoute(record.mine_guid, record.nod_guid) },
    { title: "Title", dataIndex: "nod_title", key: "nod_title" },
    { title: "Type", dataIndex: "nod_type", key: "nod_type" },
    { title: "Status", dataIndex: "nod_status", key: "nod_status" },
    { title: "Mine", dataIndex: "mine_name", key: "mine_name", link: (record: any) => router.MINE_GENERAL.dynamicRoute(record.mine_guid) },
  ];

  const tabItems = [
    {
      key: "all",
      label: `All (${totalResults})`,
      children: totalResults === 0 ? renderEmptyState() : (
        <>
          {mineResults.length > 0 && (
            <MineResultsTable
              header={`Mines (${facetCounts.mine})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={mineResults}
              showAdvancedLookup={false}
            />
          )}
          {peopleResults.length > 0 && (
            <ContactResultsTable
              header={`People (${facetCounts.person})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={peopleResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {organizationResults.length > 0 && (
            <ContactResultsTable
              header={`Organizations (${facetCounts.organization})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={organizationResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {permitResults.length > 0 && (
            <PermitResultsTable
              header={`Permits (${facetCounts.permit})`}
              highlightRegex={highlightRegex}
              searchResults={permitResults}
            />
          )}
          {explosivesPermitResults.length > 0 && (
            <GenericResultsTable
              header={`Explosives Permits (${facetCounts.explosives_permit})`}
              searchResults={explosivesPermitResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.explosives_permit_guid}
              columns={explosivesColumns}
            />
          )}
          {nowApplicationResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Work (${facetCounts.now_application})`}
              searchResults={nowApplicationResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.now_application_guid}
              columns={nowColumns}
            />
          )}
          {nodResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Departure (${facetCounts.notice_of_departure})`}
              searchResults={nodResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.nod_guid}
              columns={nodColumns}
            />
          )}
          {documentResults.length > 0 && (
            <DocumentResultsTable
              header={`Documents (${facetCounts.mine_documents + facetCounts.permit_documents})`}
              highlightRegex={highlightRegex}
              searchResults={documentResults}
            />
          )}
        </>
      ),
    },
    {
      key: "mine",
      label: `Mines (${facetCounts.mine})`,
      children: mineResults.length === 0 ? renderEmptyState() : (
        <MineResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={query}
          searchResults={mineResults}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "people",
      label: `People (${facetCounts.person})`,
      children: peopleResults.length === 0 ? renderEmptyState() : (
        <ContactResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={query}
          searchResults={peopleResults}
          partyRelationshipTypeHash={partyRelationshipTypeHash}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "organization",
      label: `Organizations (${facetCounts.organization})`,
      children: organizationResults.length === 0 ? renderEmptyState() : (
        <ContactResultsTable
          header=""
          highlightRegex={highlightRegex}
          query={query}
          searchResults={organizationResults}
          partyRelationshipTypeHash={partyRelationshipTypeHash}
          showAdvancedLookup={true}
        />
      ),
    },
    {
      key: "permit",
      label: `Permits (${facetCounts.permit})`,
      children: permitResults.length === 0 ? renderEmptyState() : (
        <PermitResultsTable
          header=""
          highlightRegex={highlightRegex}
          searchResults={permitResults}
        />
      ),
    },
    {
      key: "explosives_permit",
      label: `Explosives (${facetCounts.explosives_permit})`,
      children: explosivesPermitResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={explosivesPermitResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.explosives_permit_guid}
          columns={explosivesColumns}
        />
      ),
    },
    {
      key: "now_application",
      label: `NoW (${facetCounts.now_application})`,
      children: nowApplicationResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={nowApplicationResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.now_application_guid}
          columns={nowColumns}
        />
      ),
    },
    {
      key: "notice_of_departure",
      label: `NODs (${facetCounts.notice_of_departure})`,
      children: nodResults.length === 0 ? renderEmptyState() : (
        <GenericResultsTable
          header=""
          searchResults={nodResults}
          highlightRegex={highlightRegex}
          getRecordKey={(record: any) => record.nod_guid}
          columns={nodColumns}
        />
      ),
    },
    {
      key: "document",
      label: `Documents (${facetCounts.mine_documents + facetCounts.permit_documents})`,
      children: documentResults.length === 0 ? renderEmptyState() : (
        <DocumentResultsTable
          header=""
          highlightRegex={highlightRegex}
          searchResults={documentResults}
        />
      ),
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={onTabChange}
      items={tabItems}
      size="large"
      animated={{ inkBar: false, tabPane: false }}
      className="search-results-tabs"
    />
  );
};
