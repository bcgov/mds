import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@/components/common/CoreTable";
import { getPermitAmendmentTypeOptionsHash } from "@common/selectors/staticContentSelectors";

const propTypes = {
  permit: CustomPropTypes.permit.isRequired,
  permitAmendmentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const renderDocumentLink = (document) => (
  <DocumentLink
    documentManagerGuid={document.document_manager_guid}
    documentName={document.document_name}
  />
);

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
        render: (text) => <div title="Issue Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>,
      },
      {
        title: "Authorization End Date",
        dataIndex: "authorization_end_date",
        sortField: "authorization_end_date",
        render: (text) => (
          <div title="Authorization End Date">{formatDate(text) || Strings.EMPTY_FIELD}</div>
        ),
      },
      {
        title: "Documents",
        dataIndex: "related_documents",
        key: "related_documents",
        render: (text) => (
          <div title="Documents">
            <ul>
              {text?.map((file) => (
                <li className="wrapped-text" key={file.document_manager_guid}>
                  {renderDocumentLink(file)}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    ];

    return (
      <CoreTable
        condition
        columns={columns}
        dataSource={this.transformRowData(this.props.permit.permit_amendments || [])}
      />
    );
  }
}

PermitAmendmentTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitAmendmentTypeOptionsHash: getPermitAmendmentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(PermitAmendmentTable);
