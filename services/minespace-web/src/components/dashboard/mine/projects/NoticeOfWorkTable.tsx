import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Badge } from "antd";
import CoreTable from "@mds/common/components/common/CoreTable";
import * as Strings from "@mds/common/constants/strings";
import { INoticeOfWork } from "@mds/common/interfaces";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import { isEmpty } from "lodash";
import { getApplicationStatusType } from "@mds/common/constants/badgeStatusTypes";
import { SortOrder } from "antd/es/table/interface";
import { dateSorter, formatDate } from "@mds/common/redux/utils/helpers";
import { downloadNowDocument } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import * as routes from "@/constants/routes";

interface NoticeOfWorkTableProps {
  isLoaded: boolean;
  applications: INoticeOfWork[];
}

const transformRowData = (applications: INoticeOfWork[]) =>
  applications?.map((application) => ({
    key: application.now_application_guid,
    now_application_guid: application.now_application_guid,
    now_number: application.now_number ?? Strings.EMPTY_FIELD,
    notice_of_work_type_description:
      application.notice_of_work_type_description ?? Strings.EMPTY_FIELD,
    now_application_status_description:
      application.now_application_status_description ?? Strings.EMPTY_FIELD,
    received_date: formatDate(application.received_date) ?? Strings.EMPTY_FIELD,
    originating_system: application.originating_system ?? Strings.EMPTY_FIELD,
    document:
      application.application_documents?.length > 0 ? application.application_documents[0] : {},
    application_progress: application.application_progress,
    mine_guid: application.mine_guid,
  }));

export const NoticeOfWorkTable: FC<NoticeOfWorkTableProps> = ({ isLoaded, applications }) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const columns = [
    {
      title: "Number",
      key: "now_number",
      dataIndex: "now_number",
      sorter: (a, b) => (a.now_number > b.now_number ? -1 : 1),
      render: (text) => <div title="Number">{text}</div>,
    },
    {
      title: "Type",
      key: "notice_of_work_type_description",
      dataIndex: "notice_of_work_type_description",
      sorter: (a, b) =>
        a.notice_of_work_type_description > b.notice_of_work_type_description ? -1 : 1,
      render: (text) => <div title="Type">{text}</div>,
    },
    {
      title: "Status",
      key: "now_application_status_description",
      dataIndex: "now_application_status_description",
      sorter: (a, b) =>
        a.now_application_status_description > b.now_application_status_description ? -1 : 1,
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
      sorter: dateSorter("received_date"),
      defaultSortOrder: "descend" as SortOrder,
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
    ...(isFeatureEnabled(Feature.MINESPACE_NOW_APPLICATION_DETAILS_VIEW)
      ? [
          {
            title: "",
            dataIndex: "project",
            render: (text, record) => {
              return (
                <div>
                  <Row gutter={1}>
                    <Col span={12}>
                      <Link
                        to={routes.VIEW_NOTICE_OF_WORK.dynamicRoute(record.now_application_guid)}
                      >
                        View
                      </Link>
                    </Col>
                  </Row>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <CoreTable
      loading={!isLoaded}
      columns={columns}
      dataSource={transformRowData(applications)}
      emptyText="This mine has no project data."
    />
  );
};

export default NoticeOfWorkTable;
