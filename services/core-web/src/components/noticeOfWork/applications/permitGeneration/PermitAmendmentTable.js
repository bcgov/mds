import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Badge, Popconfirm } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  getVarianceStatusOptionsHash,
  getHSRCMComplianceCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getInspectorsHash } from "@common/selectors/partiesSelectors";
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
import { getVarianceApplicationBadgeStatusType } from "@/constants/theme";

const propTypes = {};

const defaultProps = {};

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

export class PermitAmendmentTable extends Component {
  transformRowData = (permitAmendments) =>
    permitAmendments.map((amendment) => ({
      key: amendment.permit_amendment_guid,
      ...amendment,
    }));

  render() {
    const columns = [
      // {
      //   title: "",
      //   dataIndex: "is_overdue",
      //   render: (isOverdue) => (
      //     <div title="Expired">
      //       {isOverdue ? <img className="padding-sm" src={RED_CLOCK} alt="Expired" /> : ""}
      //     </div>
      //   ),
      // },
      {
        title: "Issue Date",
        dataIndex: "issue_date",
        sortField: "issue_date",
        render: (text) => (
          <div title="Issue Date">
            {formatDate(text)}
          </div>
        ),
      },
      {
        title: "Expiry Date",
        dataIndex: "authorization_end_date",
        sortField: "authorization_end_date",
        render: (text) => (
          <div title="Expiry Date">
            {formatDate(text)}
          </div>
        ),
      },
      {
        title: "Permit Files",
        dataIndex: "related_documents",
        key: "related_documents",
        render: (text) => (
          <div title="Permit Files">
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
          scroll: { y: 500 },
        }}
      />
    );
  }
}

PermitAmendmentTable.propTypes = propTypes;
PermitAmendmentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  // complianceCodesHash: getHSRCMComplianceCodesHash(state),
  // inspectorsHash: getInspectorsHash(state),
  // varianceStatusOptionsHash: getVarianceStatusOptionsHash(state),
});

export default connect(mapStateToProps)(PermitAmendmentTable);
