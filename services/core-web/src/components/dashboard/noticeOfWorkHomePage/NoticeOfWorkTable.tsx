import React, { FC } from "react";
import { Input, Button, Badge } from "antd";
import { isEmpty } from "lodash";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, RouteComponentProps, useLocation, withRouter } from "react-router-dom";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import {
  formatDate,
  optionsFilterLabelAndValue,
  optionsFilterLabelOnly,
} from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";
import { getApplicationStatusType } from "@/constants/theme";
import DocumentLink from "@/components/common/DocumentLink";
import { INoticeOfWork, IOption } from "@mds/common";
import { ColumnType } from "antd/es/table";
import { SortOrder } from "antd/es/table/interface";
import { NoWSearchParams } from "./NoticeOfWorkHomePage";

/**
 * NoticeOfWorkTable - paginated list of notice of work applications
 */

interface NoticeOfWorkTableProps {
  noticeOfWorkApplications: INoticeOfWork[];
  isLoaded: boolean;
  handleSearch: (searchParams: NoWSearchParams) => void;
  sortField: string;
  sortDir: string;
  searchParams: NoWSearchParams;
  defaultParams: NoWSearchParams;
  mineRegionHash: object;
  mineRegionOptions: IOption;
  applicationTypeOptions: IOption;
  applicationStatusOptions: IOption;
}

const handleTableChange = (updateNOWList, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    ...tableFilters,
    ...filters,
    now_application_status_description: filters.now_application_status_description
      ? filters.now_application_status_description
      : [],
    mine_region: filters.mine_region ? filters.mine_region : [],
    originating_system: filters.originating_system ? filters.originating_system : [],
    notice_of_work_type_description: filters.notice_of_work_type_description
      ? filters.notice_of_work_type_description
      : [],
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
  };
  updateNOWList(params);
};

const applySortIndicator = (
  columns: ColumnType<Partial<INoticeOfWork>>[],
  field: string,
  dir: string
): ColumnType<Partial<INoticeOfWork>>[] =>
  columns.map((column) => {
    return {
      ...column,
      sortOrder: dir && column.key === field ? (dir.concat("end") as SortOrder) : null,
    };
  });

const pageTitle = "Browse Notices of Work";

const NoticeOfWorkTable: FC<RouteComponentProps & NoticeOfWorkTableProps> = ({
  sortField,
  sortDir,
  noticeOfWorkApplications = [],
  ...props
}: NoticeOfWorkTableProps) => {
  const location = useLocation();
  let searchInput: string;

  const ensureListValue = (value: string[] | string) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value) {
      return [value];
    }
    return [];
  };

  const createLinkTo = (route, record: INoticeOfWork & { key: string }) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        applicationPageFromRoute: {
          route: location.pathname + location.search,
          title: pageTitle,
        },
      },
    };
  };

  const transformRowData = (applications: INoticeOfWork[]) =>
    applications.map((application) => ({
      key: application.now_application_guid,
      now_application_guid: application.now_application_guid,
      now_number: application.now_number || Strings.EMPTY_FIELD,
      mine_name: application.mine_name || Strings.EMPTY_FIELD,
      mine_guid: application.mine_guid,
      mine_region: application.mine_region
        ? props.mineRegionHash[application.mine_region]
        : Strings.EMPTY_FIELD,
      notice_of_work_type_description:
        application.notice_of_work_type_description || Strings.EMPTY_FIELD,
      lead_inspector_name: application.lead_inspector_name || Strings.EMPTY_FIELD,
      lead_inspector_party_guid: application.lead_inspector_party_guid,
      issuing_inspector_name: application.issuing_inspector_name || Strings.EMPTY_FIELD,
      issuing_inspector_party_guid: application.issuing_inspector_party_guid,
      now_application_status_description:
        application.now_application_status_description || Strings.EMPTY_FIELD,
      received_date: formatDate(application.received_date) || Strings.EMPTY_FIELD,
      originating_system: application.originating_system || Strings.EMPTY_FIELD,
      document:
        application.application_documents?.length > 0 ? application.application_documents[0] : {},
      is_historic: application.is_historic,
    }));

  const filterProperties = (name, field) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys }) => {
      // undefined = nothing entered, but '' = user has cleared the text
      const searchInputValue =
        selectedKeys[0] !== undefined ? selectedKeys[0] : props.searchParams[field];
      return (
        <div style={{ padding: 8 }}>
          <Input
            id={field}
            ref={(node) => {
              searchInput = node && node?.input?.value;
            }}
            placeholder={`Search ${name}`}
            value={searchInputValue}
            onChange={(e) => setSelectedKeys([e.target.value])}
            onPressEnter={() => {
              props.handleSearch({ ...props.searchParams, [field]: searchInput });
            }}
            style={{ marginBottom: 8 }}
            allowClear
          />
          <div>
            <Button
              type="primary"
              onClick={() => {
                props.handleSearch({ ...props.searchParams, [field]: searchInput });
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                props.handleSearch({
                  ...props.searchParams,
                  [field]: props.defaultParams[field],
                });
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </div>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
  });

  const columns: ColumnType<INoticeOfWork>[] = [
    {
      title: "Number",
      key: "now_number",
      dataIndex: "now_number",
      sorter: true,
      ...filterProperties("Number", "now_number"),
      render: (text) => <div title="Number">{text}</div>,
    },
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sorter: true,
      ...filterProperties("Mine", "mine_name"),
      render: (text, record) =>
        (record.mine_guid && (
          <Link to={router.MINE_NOW_APPLICATIONS.dynamicRoute(record.mine_guid)} title="Mine">
            {text}
          </Link>
        )) || <div title="Mine">{text}</div>,
    },
    {
      title: "Region",
      key: "mine_region",
      dataIndex: "mine_region",
      sorter: true,
      filteredValue: ensureListValue(props.searchParams.mine_region),
      filters: optionsFilterLabelAndValue(props.mineRegionOptions).sort((a, b) =>
        a.value > b.value ? 1 : -1
      ),
      render: (text) => <div title="Region">{text}</div>,
    },
    {
      title: "Type",
      key: "notice_of_work_type_description",
      dataIndex: "notice_of_work_type_description",
      sorter: true,
      filteredValue: ensureListValue(props.searchParams.notice_of_work_type_description),
      filters: optionsFilterLabelOnly(props.applicationTypeOptions).sort((a, b) =>
        a.value > b.value ? 1 : -1
      ),
      render: (text) => <div title="Type">{text}</div>,
    },
    {
      title: "Lead Inspector",
      key: "lead_inspector_name",
      dataIndex: "lead_inspector_name",
      sorter: true,
      ...filterProperties("Lead Inspector", "lead_inspector_name"),
      render: (text, record) =>
        (record.lead_inspector_party_guid && (
          <Link
            to={router.PARTY_PROFILE.dynamicRoute(record.lead_inspector_party_guid)}
            title="Lead Inspector"
          >
            {text}
          </Link>
        )) || <div title="Lead Inspector">{text}</div>,
    },
    {
      title: "Issuing Inspector",
      key: "issuing_inspector_name",
      dataIndex: "issuing_inspector_name",
      sorter: true,
      ...filterProperties("Issuing Inspector", "issuing_inspector_name"),
      render: (text, record) =>
        (record.issuing_inspector_party_guid && (
          <Link
            to={router.PARTY_PROFILE.dynamicRoute(record.issuing_inspector_party_guid)}
            title="Issuing Inspector"
          >
            {text}
          </Link>
        )) || <div title="Issuing Inspector">{text}</div>,
    },
    {
      title: "Status",
      key: "now_application_status_description",
      dataIndex: "now_application_status_description",
      sorter: true,
      filteredValue: ensureListValue(props.searchParams.now_application_status_description),
      filters: optionsFilterLabelOnly(props.applicationStatusOptions).sort((a, b) =>
        a.value > b.value ? 1 : -1
      ),
      render: (text) => (
        <div title="Status">
          <Badge status={getApplicationStatusType(text)} text={text} />
        </div>
      ),
    },
    {
      title: "Received",
      key: "received_date",
      dataIndex: "received_date",
      sorter: true,
      defaultSortOrder: "descend",
      render: (text) => <div title="Received">{text}</div>,
    },
    {
      title: "Source",
      key: "originating_system",
      dataIndex: "originating_system",
      sorter: true,
      filteredValue: ensureListValue(props.searchParams.originating_system),
      filters: [
        { text: "Core", value: "Core" },
        { text: "NROS", value: "NROS" },
        { text: "VFCBC", value: "VFCBC" },
        { text: "MMS", value: "MMS" },
      ],
      render: (text) => <div title="Source">{text}</div>,
    },
    {
      title: "Application",
      dataIndex: "document",
      key: "document",
      render: (text, record) =>
        !isEmpty(text) ? (
          <div title="Application" className="cap-col-height">
            <DocumentLink
              documentManagerGuid={text.document_manager_guid}
              documentName={text.filename}
              onClickAlternative={() =>
                downloadNowDocument(text.id, record.now_application_guid, text.filename)
              }
              truncateDocumentName={false}
            />
          </div>
        ) : (
          Strings.EMPTY_FIELD
        ),
    },
    {
      key: "operations",
      render: (record) =>
        record.key && (
          <div className="btn--middle flex">
            <Link to={createLinkTo(router.NOTICE_OF_WORK_APPLICATION, record)}>
              <Button type="primary" disabled={record.is_historic}>
                Open
              </Button>
            </Link>
            <Link to={createLinkTo(router.VIEW_NOTICE_OF_WORK_APPLICATION, record)}>
              <Button type="primary" size="small" ghost>
                <EyeOutlined className="icon-lg icon-svg-filter" />
              </Button>
            </Link>
          </div>
        ),
    },
  ];

  return (
    <CoreTable
      condition={props.isLoaded}
      columns={applySortIndicator(columns, sortField, sortDir)}
      onChange={handleTableChange(props.handleSearch, props.searchParams)}
      dataSource={transformRowData(noticeOfWorkApplications)}
    />
  );
};

export default withRouter(NoticeOfWorkTable);
