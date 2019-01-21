import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col, Divider, Icon, Button } from "antd";

import { getMine, getExpectedDocumentStatusOptions } from "@/selectors/userMineInfoSelector";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import {
  fetchMineRecordById,
  fetchExpectedDocumentStatusOptions,
  updateExpectedDocument,
} from "@/actionCreators/userDashboardActionCreator";
import { RED_CLOCK } from "@/constants/assets";
import { ENVIRONMENT } from "@/constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL } from "@/constants/API";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      mineId: PropTypes.string,
    },
  }).isRequired,
  expectedDocumentStatusOptions: PropTypes.array,
  selectedDocument: PropTypes.object,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  updateExpectedDocument: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  expectedDocumentStatusOptions: [],
  selectedDocument: {},
};

const DocumentStatusText = ({ doc, expectedDocumentStatusOptions }) => {
  if (!expectedDocumentStatusOptions[0]) return "Loading...";
  if (!doc) return "Loading...";

  return doc.exp_document_status_guid === "None"
    ? expectedDocumentStatusOptions[0].label
    : expectedDocumentStatusOptions.find(({ value }) => value === doc.exp_document_status_guid)
        .label;
};
export class MineInfo extends Component {
  state = { isLoaded: false, selectedDocument: {} };

  componentDidMount() {
    const { mineId } = this.props.match.params;
    this.props.fetchExpectedDocumentStatusOptions();
    this.props.fetchMineRecordById(mineId).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  getFileFromDocumentManager = (docMgrFileGuid) => {
    const url = `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_FILE_GET_URL}/${docMgrFileGuid}`;
    window.open(url, "_blank");
    // Document_manager GET endpoint is unathenticated right now.
    // TODO: updated this when Document manager tokens are implmeneted.
  };

  handleEditReportSubmit = () => {
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.received_date = moment();
    this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, { document: updatedDocument })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  openEditReportModal(event, onSubmit, title, statusOptions, doc) {
    this.setState({
      selectedDocument: doc,
    });
    event.preventDefault();

    this.props.openModal({
      props: { onSubmit, title, statusOptions, selectedDocument: doc },
      content: modalConfig.EDIT_REPORT,
    });
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    return (
      <div className="mine-info-padding">
        {this.props.mine && (
          <div>
            <Row>
              <Col xs={1} sm={1} md={2} lg={4} />
              <Col xs={22} sm={22} md={14} lg={12}>
                <h1 className="mine-title">{this.props.mine.mine_name}</h1>
                <p>Mine No.{this.props.mine.mine_no}</p>
              </Col>
              <Col xs={22} sm={22} md={6} lg={4}>
                <QuestionSidebar />
              </Col>
              <Col xs={1} sm={1} md={2} lg={4} />
            </Row>
            <Row>
              <Col xs={1} sm={1} md={2} lg={4} />
              <Col xs={22} sm={22} md={20} lg={16}>
                <h2>2018 Reports</h2>
                <br />
                <Row gutter={16} className="mine-info-header-row">
                  <Col span={1} />
                  <Col span={7}>
                    <h4>Name</h4>
                  </Col>
                  <Col span={2}>
                    <h4>Due</h4>
                  </Col>
                  <Col span={2}>
                    <h4>Received</h4>
                  </Col>
                  <Col span={4}>
                    <h4>Status</h4>
                  </Col>
                  <Col span={4}>
                    <h4>Documents</h4>
                  </Col>
                  <Col span={4} />
                </Row>
                {this.props.mine.mine_expected_documents
                  .sort((doc1, doc2) => {
                    if (!(Date.parse(doc1.due_date) === Date.parse(doc2.due_date)))
                      return Date.parse(doc1.due_date) > Date.parse(doc2.due_date) ? 1 : -1;
                    return doc1.exp_document_name > doc2.exp_document_name ? 1 : -1;
                  })
                  .map((doc, id) => {
                    const isOverdue =
                      Date.parse(doc.due_date) < new Date() &&
                      (doc.exp_document_status_guid === "None" ||
                        (this.props.expectedDocumentStatusOptions[0] &&
                          doc.exp_document_status_guid ===
                            this.props.expectedDocumentStatusOptions[0].value));
                    return (
                      <div key={doc.exp_document_guid}>
                        <Row gutter={16} justify="center" align="top">
                          <Col span={1}>
                            {isOverdue ? (
                              <img
                                className="padding-small"
                                src={RED_CLOCK}
                                alt="Edit TSF Report"
                              />
                            ) : (
                              ""
                            )}
                          </Col>
                          <Col id={`name-${id}`} span={7}>
                            <h6>{doc.exp_document_name}</h6>
                          </Col>
                          <Col id={`due-date-${id}`} span={2}>
                            <h6>{doc.due_date === "None" ? "-" : doc.due_date}</h6>
                          </Col>
                          <Col span={2}>
                            <h6>{doc.received_date === "None" ? "-" : doc.received_date}</h6>
                          </Col>
                          <Col id={`status-${id}`} span={4}>
                            <h6 className={isOverdue ? "bold" : null}>
                              <DocumentStatusText
                                doc={doc}
                                expectedDocumentStatusOptions={
                                  this.props.expectedDocumentStatusOptions
                                }
                              />
                            </h6>
                          </Col>
                          <Col span={4}>
                            {!doc.related_documents
                              ? "-"
                              : doc.related_documents.map((file) => (
                                  <div>
                                    <a
                                      key={file.mine_document_guid}
                                      onClick={() =>
                                        this.getFileFromDocumentManager(file.document_manager_guid)
                                      }
                                    >
                                      {file.document_name}
                                    </a>
                                  </div>
                                ))}
                          </Col>
                          <Col span={4} align="right">
                            <Button
                              className="full-mobile user-upload-document-btn"
                              type="primary"
                              ghost
                              onClick={(event) =>
                                this.openEditReportModal(
                                  event,
                                  this.handleEditReportSubmit,
                                  ModalContent.EDIT_REPORT(doc.exp_document_name, moment().year()),
                                  this.props.expectedDocumentStatusOptions,
                                  doc
                                )
                              }
                            >
                              <Icon type="file-add" /> Upload
                            </Button>
                          </Col>
                        </Row>
                        <Divider type="horizontal" />
                      </div>
                    );
                  })}
              </Col>
              <Col xs={1} sm={1} md={2} lg={4} />
            </Row>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
  mine: getMine(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchExpectedDocumentStatusOptions,
      openModal,
      closeModal,
      updateExpectedDocument,
    },
    dispatch
  );

MineInfo.propTypes = propTypes;
MineInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineInfo);
