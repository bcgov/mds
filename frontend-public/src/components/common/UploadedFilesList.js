import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Icon } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CustomPropTypes from "@/customPropTypes";
import { getMine, getExpectedDocumentStatusOptions } from "@/selectors/userMineInfoSelector";
import {
  removeMineDocumentFromExpectedDocument,
  fetchMineRecordById,
} from "@/actionCreators/userDashboardActionCreator";

const propTypes = {
  selectedDocId: PropTypes.string.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  expectedDocumentStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  removeMineDocumentFromExpectedDocument: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
};

export class UploadedFilesList extends React.Component {
  unlinkFile = (event, mineDocumentGuid, expDocumentGuid) => {
    event.preventDefault();
    this.props
      .removeMineDocumentFromExpectedDocument(mineDocumentGuid, expDocumentGuid)
      .then(this.props.fetchMineRecordById(this.props.mine.guid));
  };

  canUnlink = (selectedDoc) => {
    const docStatus = this.props.expectedDocumentStatusOptions.find(
      (status) => status.value === selectedDoc.exp_document_status_guid
    );
    const dueDateCheck = moment(selectedDoc.due_date, "YYYY-MM-DD") > moment();
    const statusCheck =
      docStatus.label === "Not Received" || docStatus.label === "Received / Pending Review";
    return dueDateCheck && statusCheck;
  };

  render() {
    const selectedDoc = this.props.mine.mine_expected_documents.find(
      (expDoc) => expDoc.exp_document_guid === this.props.selectedDocId
    );
    const unlink = this.canUnlink(selectedDoc);
    return (
      <div>
        {selectedDoc.related_documents.map((file) => (
          <div
            className="padding-small margin-small lightest-grey-bg"
            key={file.mine_document_guid}
          >
            <Row className="padding-small">
              <Col span={21}>
                <p className={unlink ? "nested-table-header left" : "nested-table-header center"}>
                  {file.document_name}
                </p>
              </Col>
              {unlink && (
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
                    onConfirm={(event) =>
                      this.unlinkFile(event, file.mine_document_guid, this.props.selectedDocId)
                    }
                  >
                    <button type="button">
                      <Icon type="close" />
                    </button>
                  </Popconfirm>
                </Col>
              )}
            </Row>
          </div>
        ))}
      </div>
    );
  }
}

UploadedFilesList.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mine: getMine(state),
  expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ removeMineDocumentFromExpectedDocument, fetchMineRecordById }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadedFilesList);
