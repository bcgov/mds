import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Icon } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import CustomPropTypes from "@/customPropTypes";
import {
  removeMineDocumentFromExpectedDocument,
  fetchMineRecordById,
} from "@/actionCreators/mineActionCreator";
import { getMines } from "@/selectors/mineSelectors";
import { getExpectedDocumentStatusOptions } from "@/selectors/staticContentSelectors";

const propTypes = {
  selectedDocGuid: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  removeMineDocumentFromExpectedDocument: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  expectedDocumentStatusOptions: PropTypes.arrayOf(CustomPropTypes.documentStatus).isRequired,
};

export class UploadedFilesList extends React.Component {
  unlinkFile = (event, mineDocumentGuid, expDocumentGuid) => {
    event.preventDefault();
    this.props
      .removeMineDocumentFromExpectedDocument(mineDocumentGuid, expDocumentGuid)
      .then(this.props.fetchMineRecordById(this.props.mineGuid));
  };

  canUnlink = (selectedDoc) => {
    const docStatus = this.props.expectedDocumentStatusOptions.find(
      (status) => status.value === selectedDoc.exp_document_status_guid
    );

    if (moment(selectedDoc.due_date, "YYYY-MM-DD") > moment()) {
      if (docStatus.label === "Not Received" || docStatus.label === "Received / Pending Review") {
        return true;
      }
    }
    return false;
  };

  render() {
    const selectedDoc = this.props.mines[this.props.mineGuid].mine_expected_documents.find(
      (expDoc) => expDoc.exp_document_guid === this.props.selectedDocGuid
    );
    const unlink = this.canUnlink(selectedDoc);
    return (
      <div>
        {selectedDoc.related_documents.map((file, key) => (
          <div className="padding-small margin-small lightest-grey-bg" key={key}>
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
                      this.unlinkFile(event, file.mine_document_guid, this.props.selectedDocGuid)
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
  mines: getMines(state),
  expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      removeMineDocumentFromExpectedDocument,
      fetchMineRecordById,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadedFilesList);
