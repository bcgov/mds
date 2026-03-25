import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Badge, Tooltip } from "antd";
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
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import { NOW_APPLICATION_PROGRESS_STATUS_CODES } from "@mds/common/constants/enums";

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
    now_application_tier_code: application.now_application_tier_code,
    now_application_tier_description: application.now_application_tier_description,
    now_application_tier_created_date: application.now_application_tier_created_date,
    now_application_tier_updated_date: application.now_application_tier_updated_date,
    mine_guid: application.mine_guid,
    review_started:
      formatDate(
        application.application_progress?.find(
          (p) =>
            p.application_progress_status_code ==
            NOW_APPLICATION_PROGRESS_STATUS_CODES.TECHNICAL_REVIEW
        )?.start_date
      ) ?? Strings.EMPTY_FIELD,
  }));

export const NoticeOfWorkTable: FC<NoticeOfWorkTableProps> = ({ isLoaded, applications }) => {
  const { isFeatureEnabled } = useFeatureFlag();
  const hasTypeMineralOrCoal = applications.some(
    (app) =>
      app.notice_of_work_type_description === "Mineral" ||
      app.notice_of_work_type_description === "Coal"
  );
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
    ...(isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) && hasTypeMineralOrCoal
      ? [
          {
            title: (
              <div>
                Tier
                <Tooltip
                  overlayClassName="minespace-tooltip"
                  title="Tier applies only to mineral and coal exploration applications. It indicates 
                the assigned review tier based on the application details"
                >
                  {" "}
                  <InfoCircleOutlined className="info-tooltip icon-sm" />
                </Tooltip>
              </div>
            ),
            key: "now_application_tier_code",
            dataIndex: "now_application_tier_code",
            width: "120px",
            sorter: (a, b) => (a.now_application_tier_code > b.now_application_tier_code ? -1 : 1),
            defaultSortOrder: "descend" as SortOrder,
            render: (text, record) => {
              const isExploration =
                record?.notice_of_work_type_description === "Mineral" ||
                record?.notice_of_work_type_description === "Coal";
              const now_application_tier_code = record.now_application_tier_code;
              return !isEmpty(now_application_tier_code) && isExploration ? (
                <div title="Tier">{now_application_tier_code}</div>
              ) : (
                Strings.EMPTY_FIELD
              );
            },
          },
        ]
      : []),
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
      render: (text) => <div title="Received">{text} </div>,
    },
    {
      title: (
        <div>
          Review Started
          <Tooltip
            overlayClassName="minespace-tooltip"
            title="Accepted by Ministry to initiate Technical Review"
          >
            {" "}
            <InfoCircleOutlined className="info-tooltip icon-sm" />
          </Tooltip>
        </div>
      ),
      key: "review_started",
      dataIndex: "review_started",
      sorter: dateSorter("review_started"),
      defaultSortOrder: "descend" as SortOrder,
      render: (text) => <div title="Review Started">{text}</div>,
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
