import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Icon, Divider } from "antd";
import ConditionalButton from "@/components/common/ConditionalButton"
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { BRAND_PENCIL, RED_CLOCK } from "@/constants/assets";
import {
  createMineExpectedDocument,
  removeExpectedDocument,
  updateExpectedDocument,
} from "@/actionCreators/mineActionCreator";
import {
  fetchExpectedDocumentStatusOptions,
  fetchMineTailingsRequiredDocuments,
} from "@/actionCreators/staticContentActionCreator";
import {
  getExpectedDocumentStatusOptions,
  getMineTSFRequiredReports,
} from "@/selectors/staticContentSelectors";
import { createDropDownList } from "@/utils/helpers";

import { ENVIRONMENT } from "@/constants/environment";
import { DOCUMENT_MANAGER_FILE_GET_URL } from "@/constants/API";
/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  expectedDocumentStatusOptions: PropTypes.array,
  updateExpectedDocument: PropTypes.func.isRequired,
  removeExpectedDocument: PropTypes.func.isRequired,
  selectedDocument: PropTypes.object,
  mineTSFRequiredReports: PropTypes.array.isRequired,
  fetchMineTailingsRequiredDocuments: PropTypes.func.isRequired,
  createMineExpectedDocument: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
  expectedDocumentStatusOptions: [],
};

const DocumentStatusText = ({ doc, expectedDocumentStatusOptions }) => {
  if (!expectedDocumentStatusOptions[0]) return "Loading...";
  if (!doc) return "Loading...";

  return doc.exp_document_status_guid === "None"
    ? expectedDocumentStatusOptions[0].label
    : expectedDocumentStatusOptions.find((x) => x.value === doc.exp_document_status_guid).label;
};
/*
  return  */
export class MineTailingsInfo extends Component {
  state = { selectedDocument: {} };

  componentDidMount() {
    this.props.fetchExpectedDocumentStatusOptions();
    this.props.fetchMineTailingsRequiredDocuments();
  }

  handleAddTailingsSubmit = (value) => {
    this.props
      .createTailingsStorageFacility({
        ...value,
        mine_guid: this.props.mine.guid,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  handleAddReportSubmit = (value) => {
    const requiredReport = this.props.mineTSFRequiredReports.find(
      (x) => x.req_document_guid === value.req_document_guid
    );
    const newRequiredReport = {
      document_name: requiredReport.req_document_name,
      req_document_guid: requiredReport.req_document_guid,
    };
    this.props.createMineExpectedDocument(this.props.mine.guid, newRequiredReport).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    });
  };

  handleEditReportSubmit = (value) => {
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.exp_document_name = value.tsf_report_name;
    updatedDocument.due_date = value.tsf_report_due_date;
    updatedDocument.received_date = value.tsf_report_received_date;
    updatedDocument.exp_document_status_guid = value.tsf_report_status;
    this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, { document: updatedDocument })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  removeReport = (event, exp_doc_guid) => {
    event.preventDefault();
    this.props.removeExpectedDocument(exp_doc_guid).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
    });
  };

  openAddReportModal(event, onSubmit, title, mineTSFRequiredReports) {
    event.preventDefault();
    const mineTSFRequiredReportsDropDown = createDropDownList(
      mineTSFRequiredReports,
      "req_document_name",
      "req_document_guid"
    );
    this.props.openModal({
      props: { onSubmit, title, mineTSFRequiredReportsDropDown },
      content: modalConfig.ADD_TAILINGS_REPORT,
    });
  }

  openAddTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  openEditReportModal(event, onSubmit, title, statusOptions, doc) {
    this.setState({
      selectedDocument: doc,
    });
    event.preventDefault();

    if (doc) {
      const initialValues = {
        tsf_report_name: doc.exp_document_name === "None" ? null : doc.exp_document_name,
        tsf_report_due_date: doc.due_date === "None" ? null : doc.due_date,
        tsf_report_received_date: doc.received_date === "None" ? null : doc.received_date,
        tsf_report_status:
          doc.exp_document_status_guid === "None" ? null : doc.exp_document_status_guid,
      };
      this.props.openModal({
        props: { onSubmit, title, statusOptions, initialValues, selectedDocument: doc },
        content: modalConfig.EDIT_TAILINGS_REPORT,
      });
    }
  }

  getFileFromDocumentManager(docMgrFileGuid) {
    const url = `${ENVIRONMENT.apiUrl + DOCUMENT_MANAGER_FILE_GET_URL}/${docMgrFileGuid}`;
    window.open(url, "_blank");
    // Document_manager GET endpoint is unathenticated right now.
    // TODO: updated this when Document manager tokens are implmeneted.
  }

  render() {
    return (
      <div>
        <div>
          <br />
          <br />
          {this.props.mine.mine_tailings_storage_facility.map((facility, id) => (
            <Row key={id} gutter={16}>
              <Col span={6}>
                <h3>{facility.mine_tailings_storage_facility_name}</h3>
              </Col>
              <Col span={6} />
            </Row>
          ))}
          <div className="center">            
            <ConditionalButton
              className="full-mobile"
              type="primary"
              handleAction={(event) =>
                this.openAddTailingsModal(
                  event,
                  this.handleAddTailingsSubmit,
                  ModalContent.ADD_TAILINGS
                )
              }
              string={ModalContent.ADD_TAILINGS}
            />
          </div>
        </div>
        <br />
        <br />
        <div>
          <h3>Reports</h3>
          <br />
          <Row gutter={16} justify="center" align="top">
            <Col span={1} />
            <Col span={8}>
              <h5>Name</h5>
            </Col>
            <Col span={2}>
              <h5>Due</h5>
            </Col>
            <Col span={2}>
              <h5>Received</h5>
            </Col>
            <Col span={4}>
              <h5>Status</h5>
            </Col>
            <Col span={3}>
              <h5>Documents</h5>
            </Col>
            <Col span={4} />
          </Row>
          <Divider type="horizontal" className="thick-divider" />
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
                    doc.exp_document_Status_guid ===
                      this.props.expectedDocumentStatusOptions[0].value));
              return (
                <div key={doc.exp_document_guid}>
                  <Row gutter={16} justify="center" align="top">
                    <Col span={1}>
                      {isOverdue ? (
                        <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
                      ) : (
                        ""
                      )}
                    </Col>
                    <Col id={`name-${id}`} span={8}>
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
                          expectedDocumentStatusOptions={this.props.expectedDocumentStatusOptions}
                        />
                      </h6>
                    </Col>
                    <Col span={3}>
                      {!doc.related_documents
                        ? "-"
                        : doc.related_documents.map((file, id) => (
                            <div>
                              <a
                                key={id}
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
                      <ConditionalButton
                        type="primary"
                        ghost
                        handleAction={(event) =>
                          this.openEditReportModal(
                            event,
                            this.handleEditReportSubmit,
                            ModalContent.EDIT_TAILINGS_REPORT,
                            this.props.expectedDocumentStatusOptions,
                            doc
                          )
                        }
                        string={<img  src={BRAND_PENCIL} alt="Edit TSF Report" />}
                      />
                      <ConditionalButton 
                        popConfirm={{
                          placement: "topLeft",
                          title: `Are you sure you want to delete ${doc.exp_document_name}?`,
                          onConfirm: (event) => this.removeReport(event, doc.exp_document_guid),
                          okText: "Delete",
                          cancelText: "Cancel"
                        }}
                        type="primary"
                        ghost
                        string={<Icon type="minus-circle" theme="outlined" />}
                      />
                    </Col>
                  </Row>
                  <Divider type="horizontal" />
                </div>
              );
            })}
          <div key="0">
            <Row gutter={16} justify="center" align="top">
              <Col span={8} align="left">
                <ConditionalButton
                  type="secondary"
                  handleAction={(event) =>
                    this.openAddReportModal(
                      event,
                      this.handleAddReportSubmit,
                      ModalContent.ADD_TAILINGS_REPORT,
                      this.props.mineTSFRequiredReports
                    )
                  }
                  string={`+ ${ModalContent.ADD_TAILINGS_REPORT}`}
                />
              </Col>
              <Col span={12} />
              <Col span={4} align="right" />
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
  mineTSFRequiredReports: getMineTSFRequiredReports(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchExpectedDocumentStatusOptions,
      updateExpectedDocument,
      fetchMineTailingsRequiredDocuments,
      removeExpectedDocument,
      createMineExpectedDocument,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
