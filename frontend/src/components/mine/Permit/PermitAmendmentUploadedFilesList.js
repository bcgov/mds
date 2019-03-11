import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Icon } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  permitAmendmentGuid: PropTypes.string.isRequired,
  relatedDocuments: PropTypes.arrayOf(PropTypes.object),
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
};

const defaultProps = {
  relatedDocuments: [],
};

export class PermitAmendmentUploadedFilesList extends React.Component {
  state = { relatedDocuments: this.props.relatedDocuments };

  removePermitAmendmentDocument(relatedDocuments, documentGuid) {
    this.props
      .handleRemovePermitAmendmentDocument(this.props.permitAmendmentGuid, documentGuid)
      .then(() => {
        const newRelatedDocuments = relatedDocuments.filter(
          (doc) => doc.document_guid !== documentGuid
        );
        this.setState({ relatedDocuments: newRelatedDocuments });
      });
  }

  render() {
    return (
      <div>
        {this.props.relatedDocuments.map((file) => (
          <div
            className="padding-small margin-small lightest-grey-bg"
            key={file.mine_document_guid}
          >
            <Row className="padding-small">
              <Col span={21}>
                <p className="uploaded-file left">{file.document_name}</p>
              </Col>
              <Col span={3} className="right">
                <Popconfirm
                  placement="top"
                  title={
                    <div>
                      <p className="p-large">Are you sure you want to remove this file?</p>
                      <br />
                      <p className="p">
                        If it is not attached to any other reports it will be deleted.
                      </p>
                    </div>
                  }
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    this.removePermitAmendmentDocument(
                      this.state.relatedDocuments,
                      file.document_guid
                    );
                  }}
                >
                  <button type="button">
                    <Icon type="close" />
                  </button>
                </Popconfirm>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  }
}

PermitAmendmentUploadedFilesList.propTypes = propTypes;
PermitAmendmentUploadedFilesList.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PermitAmendmentUploadedFilesList);
