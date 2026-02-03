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
    mines,
    mineResults,
    peopleResults,
    organizationResults,
    permitResults,
    documentResults,
    explosivesPermitResults,
    explosivesPermits,
    nowApplicationResults,
    nowApplications,
    nodResults,
    nods,
    totalResults,
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
              header={`Mines (${mineResults.length})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={mineResults}
              showAdvancedLookup={false}
            />
          )}
          {peopleResults.length > 0 && (
            <ContactResultsTable
              header={`People (${peopleResults.length})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={peopleResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {organizationResults.length > 0 && (
            <ContactResultsTable
              header={`Organizations (${organizationResults.length})`}
              highlightRegex={highlightRegex}
              query={query}
              searchResults={organizationResults}
              partyRelationshipTypeHash={partyRelationshipTypeHash}
              showAdvancedLookup={false}
            />
          )}
          {permitResults.length > 0 && (
            <PermitResultsTable
              header={`Permits (${permitResults.length})`}
              highlightRegex={highlightRegex}
              searchResults={permitResults}
            />
          )}
          {explosivesPermitResults.length > 0 && (
            <GenericResultsTable
              header={`Explosives Permits (${explosivesPermitResults.length})`}
              searchResults={explosivesPermitResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.explosives_permit_guid}
              columns={explosivesColumns}
            />
          )}
          {nowApplicationResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Work (${nowApplicationResults.length})`}
              searchResults={nowApplicationResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.now_application_guid}
              columns={nowColumns}
            />
          )}
          {nodResults.length > 0 && (
            <GenericResultsTable
              header={`Notices of Departure (${nodResults.length})`}
              searchResults={nodResults}
              highlightRegex={highlightRegex}
              getRecordKey={(record: any) => record.nod_guid}
              columns={nodColumns}
            />
          )}
          {documentResults.length > 0 && (
            <DocumentResultsTable
              header={`Documents (${documentResults.length})`}
              highlightRegex={highlightRegex}
              searchResults={documentResults}
            />
          )}
        </>
      ),
    },
    {
      key: "mine",
      label: `Mines (${mines.length})`,
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
      label: `People (${peopleResults.length})`,
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
      label: `Organizations (${organizationResults.length})`,
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
      label: `Permits (${results.permitResults.length})`,
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
      label: `Explosives (${explosivesPermits.length})`,
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
      label: `NoW (${nowApplications.length})`,
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
      label: `NODs (${nods.length})`,
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
      label: `Documents (${documentResults.length})`,
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
