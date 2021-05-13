import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Popconfirm, Button } from "antd";
import { formatDate, truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";
import { getPermitAmendmentTypeOptionsHash } from "@common/selectors/staticContentSelectors";
import { TRASHCAN , CLOUD_CHECK_MARK } from "@/constants/assets";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";


const propTypes = {
  permit: CustomPropTypes.permit.isRequired,
  permitAmendmentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {};

const renderDocumentLink = (file, text) => (
  <LinkButton key={file.mine_document_guid} onClick={() => downloadFileFromDocumentManager(file)}>
    {text}
  </LinkButton>
);

export class PermitDocumentTable extends Component {
  transformRowData = (documents) =>
    documents.map((document) => ({
      key: document.document_manager_guid,
      ...document,
    }));

  render() {
    const columns = [
      {
        title: "Documents",
        dataIndex: "document_name",
        key: "document_name",
        render: (text, record) => (
          <div title="Documents" className="wrapped-text">
            {renderDocumentLink(record, truncateFilename(text))}
          </div>
        ),
      },
      {
        title: "",
        width: 150,
        dataIndex: "delete",
        render: (text, record) => (
          <div title="">
            <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
              <Popconfirm
                placement="topLeft"
                title={`Are you sure you want to delete ${record.document_name}?`}
                onConfirm={() =>
                  this.props.handleRemovePermitAmendmentDocument(
                    record.permit_amendment_document_guid
                  )
                }
                okText="Delete"
                cancelText="Cancel"
              >
                <Button
                  className={this.props.isViewMode ? "full-mobile disabled-icon" : "full-mobile"}
                  ghost
                  type="primary"
                  disabled={this.props.isViewMode}
                >
                  <img name="remove" src={TRASHCAN} alt="Remove User" />
                </Button>
              </Popconfirm>
            </NOWActionWrapper>
          </div>
        ),
      },
    ];
    return (
      <>
        <CoreTable
          condition
          columns={columns}
          dataSource={this.transformRowData(
            this.props.draftPermitAmendment.related_documents || []
          )}
          tableProps={{
            align: "center",
            pagination: false,
          }}
        />
      </>
    );
  }
}

PermitDocumentTable.propTypes = propTypes;
PermitDocumentTable.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  permitAmendmentTypeOptionsHash: getPermitAmendmentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(PermitDocumentTable);
