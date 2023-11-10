import React from "react";
import { connect } from "react-redux";
import { Button } from "antd";
import PropTypes from "prop-types";
import {
  truncateFilename,
  dateSorter,
  formatComplianceCodeValueOrLabel,
} from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getMineReportDefinitionHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { formatDate } from "@/utils/helpers";
import * as Strings from "@/constants/strings";
import { EDIT_PENCIL } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import LinkButton from "@/components/common/LinkButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionHash: PropTypes.objectOf(PropTypes.any).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditReportModal: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export const ReportsTable = (props) => {
  const columns = [
    {
      title: "Report Name",
      dataIndex: "report_name",
      sorter: (a, b) => a.report_name.localeCompare(b.report_name),
      render: (text) => <div title="Report Name">{text}</div>,
    },
    {
      title: "Code Section",
      key: "code_section",
      render: (record) => (
        <div title="Code Section">
          {formatComplianceCodeValueOrLabel(
            props.mineReportDefinitionHash[record.mine_report_definition_guid]
              .compliance_articles[0],
            false
          )}
        </div>
      ),
    },
    {
      title: "Compliance Year",
      dataIndex: "submission_year",
      sorter: (a, b) => (a.submission_year > b.submission_year ? -1 : 1),
      render: (text) => <div title="Compliance Year">{text}</div>,
    },
    {
      title: "Due",
      dataIndex: "due_date",
      defaultSortOrder: "ascend",
      sorter: dateSorter("due_date"),
      render: (due_date) => <div title="Due">{formatDate(due_date) || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Submitted On",
      dataIndex: "received_date",
      sorter: dateSorter("received_date"),
      render: (received_date) => (
        <div title="Submitted On">{formatDate(received_date) || Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Requested By",
      dataIndex: "created_by_idir",
      sorter: (a, b) => a.created_by_idir.localeCompare(b.created_by_idir),
      render: (text) => <div title="Requested By">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Documents",
      dataIndex: "mine_report_submissions",
      render: (text) => (
        <div title="Documents" className="cap-col-height">
          {(text &&
            text.length > 0 &&
            text[text.length - 1].documents &&
            text[text.length - 1].documents.length > 0 &&
            text[text.length - 1].documents.map((document) => (
              <LinkButton
                key={document.mine_document_guid}
                onClick={() => downloadFileFromDocumentManager(document)}
                title={document.document_name}
              >
                {truncateFilename(document.document_name)}
                <br />
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "edit",
      render: (text, record) => {
        return (
          <div title="" align="right">
            <AuthorizationWrapper>
              <Button type="link" onClick={(event) => props.openEditReportModal(event, record)}>
                <img src={EDIT_PENCIL} alt="Edit" />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      rowKey={(record) => record.mine_report_guid}
      emptyText="This mine has no report data."
      dataSource={props.mineReports}
    />
  );
};

const mapStateToProps = (state) => ({
  mineReportDefinitionHash: getMineReportDefinitionHash(state),
});

ReportsTable.propTypes = propTypes;

export default connect(mapStateToProps, null)(ReportsTable);
