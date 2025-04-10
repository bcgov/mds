import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Badge } from "antd";
import { formatDate } from "@/utils/helpers";
import * as routes from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as Strings from "@mds/common/constants/strings";
import { INoticeOfWork } from "@mds/common/interfaces";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import { downloadNowDocument } from "@common/utils/actionlessNetworkCalls";
import { isEmpty } from "lodash";
import { getApplicationStatusType } from "@mds/common/constants/badgeStatusTypes";
import { ColumnType, SortOrder } from "antd/es/table/interface";
import { NoWSearchParams } from "./NoticeOfWorkProjects";

interface NoticeOfWorkTableProps {
  isLoaded: boolean;
  applications: INoticeOfWork[];
  sortField: string;
  sortDir: string;
  handleSearch: (searchParams: NoWSearchParams) => void;
}

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

const transformRowData = (applications: INoticeOfWork[]) =>
  applications?.map((application) => ({
    key: application.now_application_guid,
    now_application_guid: application.now_application_guid,
    now_number: application.now_number || Strings.EMPTY_FIELD,
    mine_name: application.mine_name || Strings.EMPTY_FIELD,
    mine_guid: application.mine_guid,
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

export const NoticeOfWorkTable: FC<NoticeOfWorkTableProps> = ({
  isLoaded,
  applications,
  sortField,
  sortDir,
}) => {
  const createLinkTo = (route, record) => {
    return {
      pathname: route.dynamicRoute(record.key),
      state: {
        applicationPageFromRoute: {
          //route: this.props.location.pathname + this.props.location.search,
          title: `${record.mine_name} Notice of Work Applications`,
        },
      },
    };
  };

  const columns = [
    {
      title: "Number",
      key: "now_number",
      dataIndex: "now_number",
      sorter: true,
      render: (text) => <div title="Number">{text}</div>,
    },
    {
      title: "Type",
      key: "notice_of_work_type_description",
      dataIndex: "notice_of_work_type_description",
      sorter: true,
      render: (text) => <div title="Type">{text}</div>,
    },
    {
      title: "Status",
      key: "now_application_status_description",
      dataIndex: "now_application_status_description",
      sorter: true,
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
      //defaultSortOrder: "descend",
      render: (text) => <div title="Received">{text}</div>,
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
      title: "",
      dataIndex: "project",
      render: (text, record) => (
        <div title="">
          <Row gutter={1}>
            <Col span={12}>
              <Link to={"#TODO"}>View</Link>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <CoreTable
      loading={!isLoaded}
      columns={applySortIndicator(columns, sortField, sortDir)}
      dataSource={transformRowData(applications)}
      emptyText="This mine has no project data."
    />
  );
};

export default NoticeOfWorkTable;
