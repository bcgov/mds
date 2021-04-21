import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Badge, Popconfirm } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { RED_CLOCK, EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import * as router from "@/constants/routes";
import CoreTable from "@/components/common/CoreTable";
import { getPermitAmendmentTypeOptionsHash } from "@common/selectors/staticContentSelectors";
import { getVarianceApplicationBadgeStatusType } from "@/constants/theme";

const propTypes = {};

const defaultProps = {};

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

const amendmentStatusHash = {
  ACT: "Active",
};

export class PermitAmendmentTable extends Component {
  transformRowData = (permitAmendments) =>
    permitAmendments
      .filter(({ permit_amendment_status_code }) => permit_amendment_status_code !== "DFT")
      .map((amendment) => ({
        key: amendment.permit_amendment_guid,
        ...amendment,
      }));

  render() {
    const columns = [
      {
        title: "Type of Amendment",
        dataIndex: "permit_amendment_type_code",
        sortField: "permit_amendment_type_code",
        render: (text) => (
          <div title="Type of Amendment">{this.props.permitAmendmentTypeOptionsHash[text]}</div>
        ),
      },
      {
        title: "Issue Date",
        dataIndex: "issue_date",
        sortField: "issue_date",
        render: (text) => <div title="Issue Date">{formatDate(text) || "N/A"}</div>,
      },
      {
        title: "Authorization End Date",
        dataIndex: "authorization_end_date",
        sortField: "authorization_end_date",
        render: (text) => <div title="Authorization End Date">{formatDate(text) || "N/A"}</div>,
      },
      {
        title: "Documents",
        dataIndex: "related_documents",
        key: "related_documents",
        render: (text) => (
          <div title="Documents">
            <ul>
              {text?.map((file) => (
                <li className="wrapped-text">
                  {renderDocumentLink(file, truncateFilename(file.document_name))}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    ];

    return (
      <CoreTable
        condition={true}
        columns={columns}
        dataSource={this.transformRowData(this.props.permit.permit_amendments || [])}
        tableProps={{
          align: "center",
          pagination: false,
        }}
      />
    );
  }
}

PermitAmendmentTable.propTypes = propTypes;
PermitAmendmentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  permitAmendmentTypeOptionsHash: getPermitAmendmentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(PermitAmendmentTable);
