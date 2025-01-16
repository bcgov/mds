import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Row } from "antd";
import { uniqBy, flattenDeep, uniq } from "lodash";
import * as Strings from "@mds/common/constants/strings";
import {
  PROJECT_SUMMARY_STATUS_CODES,
  MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES,
  PROJECT_DECISION_PACKAGE_STATUS_CODES
} from "@mds/common/constants/enums";
import { formatDate, dateSorter } from "@mds/common/redux/utils/helpers";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as router from "@/constants/routes";
import {
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common";
import { IProject } from "@mds/common/interfaces";

interface MajorProjectTableProps {
  projects: IProject[];
  mineCommodityOptionsHash: any;
  handleSearch: (params: any) => void;
  filters: any;
  isLoaded: boolean;
  sortField: string;
  sortDir: string;
  expandedRowKeys: string[];
  onExpand: (expanded: any, record: any) => void;
}

const statusCodes = {
  ...PROJECT_SUMMARY_STATUS_CODES,
  ...MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODES,
  ...PROJECT_DECISION_PACKAGE_STATUS_CODES,
}

const transformRowData = (projects, mineCommodityHash) =>
  projects?.map((project) => ({
    key: project.project_guid,
    project_title: project.project_title,
    project_id: project.project_id,
    mine_name: project.mine?.mine_name,
    name: project.contacts
      .filter((contact) => contact.is_primary)
      .map((contact) => contact.name)[0],
    project_lead_name: project.project_lead_name,
    commodity:
      project?.mine?.mine_type && project.mine.mine_type.length > 0
        ? uniq(
          flattenDeep(
            project.mine.mine_type.reduce((result, type) => {
              if (type.mine_type_detail && type.mine_type_detail.length > 0) {
                result.push(
                  type.mine_type_detail
                    .filter((detail) => detail.mine_commodity_code)
                    .map((detail) =>
                      mineCommodityHash ? mineCommodityHash[detail.mine_commodity_code] : ""
                    )
                );
              }
              return result;
            }, [])
          )
        )
        : [],
    update_timestamp: formatDate(project.update_timestamp),
    project_summary: project.project_summary,
    information_requirements: project.information_requirements,
    major_mine_application: project.major_mine_application,
    project_decision_package: project.project_decision_package,
  }));

const transformChildRowData = (section, project) => {
  return {
    key: section.key,
    tab: section.tab,
    projectGuid: project.key,
    status: statusCodes[section.status_code] || statusCodes["NTS"],
    updateTimestamp: formatDate(section.update_timestamp) || Strings.EMPTY_FIELD,
    updateUser: section.update_user,
  }
}

const handleTableChange = (handleSearch, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
  };
  handleSearch(params);
};

export const MajorProjectTable: FC<MajorProjectTableProps> = ({
  projects,
  mineCommodityOptionsHash,
  handleSearch,
  filters,
  isLoaded,
  sortField,
  sortDir,
  expandedRowKeys,
  onExpand,
}) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const projectDecisionPackageEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_DECISION_PACKAGE);
  const columns = [
    {
      key: "project_title",
      title: "Project Title",
      dataIndex: "project_title",
      sortField: "project_title",
      sorter: true,
      render: (text, record) => (
        <Link to={router.EDIT_PROJECT.dynamicRoute(record.key)} title="Name">
          {text}
        </Link>
      ),
    },
    renderTextColumn("project_id", "Client ID", true),
    renderTextColumn("mine_name", "Mine Name", true),
    renderTextColumn("project_lead_name", "MCM Project Lead", true),
    {
      key: "commodity",
      title: "Commodity",
      dataIndex: "commodity",
      sortField: "commodity",
      sorter: false,
      render: (text) => (
        <div title="Commodity">
          {(text && text.length > 0 && text.join(", ")) || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Updated Date",
      key: "update_timestamp",
      dataIndex: "update_timestamp",
      sortField: "update_timestamp",
      render: (text) => <div title="Updated Date">{text}</div>,
      sorter: dateSorter("update_timestamp"),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      key: "project",
      dataIndex: "project",
      render: (text, record) => (
        <div title="" data-cy="major-projects-table-open-button">
          <Row gutter={1}>
            <Col span={12}>
              <Link to={router.EDIT_PROJECT.dynamicRoute(record.key)}>
                <Button type="primary">Open</Button>
              </Link>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  const childColumns = [
    { ...renderTextColumn("key", "Project Stage") },
    { ...renderTextColumn("status", "MCM Review Status") },
    { ...renderTextColumn("updateTimestamp", "Last Updated") },
    { ...renderTextColumn("updateUser", "Updated By") },
    {
      title: "",
      key: "project_section",
      render: (record) => {
        return (
          <div title="" style={{ width: "50%", margin: "0 auto" }}>
            <Row gutter={1}>
              <Col span={12}>
                <Link to={router.EDIT_PROJECT.dynamicRoute(record.projectGuid, record.tab)}>
                  <Button className="expanded-row-button" disabled={record.status === statusCodes["NTS"]}>Open</Button>
                </Link>
              </Col>
            </Row>
          </div>
        )
      },
    },
  ];

  const applySortIndicator = (_columns, field, dir) =>
    _columns.map((column) => ({
      ...column,
      sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
    }));

  const projectSectionStatuses = (project) => {
    const sections = [
      { key: "Project Description", tab: "project-description", ...project.project_summary },
      { key: "Application", tab: "app", ...project.major_mine_application },
      { key: "IRT", tab: "information-requirements-table", ...project.information_requirements },
      ...projectDecisionPackageEnabled
        ? [{ key: "Decision Package", tab: "project-decision-package", ...project.project_decision_package }]
        : [],
    ]

    return sections?.map((section) => transformChildRowData(section, project))
  }

  return (
    <CoreTable
      condition={isLoaded}
      columns={applySortIndicator(columns, sortField, sortDir)}
      dataSource={transformRowData(projects, mineCommodityOptionsHash)}
      onChange={handleTableChange(handleSearch, filters)}
      expandProps={{
        rowKey: "project_guid",
        recordDescription: "project section statuses",
        getDataSource: projectSectionStatuses,
        subTableColumns: childColumns,
        expandedRowKeys: expandedRowKeys,
        onExpand: onExpand,
      }}
    />
  );
};

export default MajorProjectTable;
