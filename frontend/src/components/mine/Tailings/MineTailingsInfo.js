import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, Row, Col, Button, Icon, Popconfirm} from 'antd';
import * as ModalContent from '@/constants/modalContent';
import { modalConfig } from '@/components/modalContent/config';
import { GREEN_PENCIL } from '@/constants/assets';
import ButtonGroup from 'antd/lib/button/button-group';
import {createMineExpectedDocument ,removeExpectedDocument } from '@/actionCreators/mineActionCreator';
import { fetchExpectedDocumentStatusOptions, fetchMineTailingsRequiredDocuments, updateExpectedDocument } from "@/actionCreators/mineActionCreator";
import { getExpectedDocumentStatusOptions, getMineTSFRequiredReports, getMineTSFRequiredDocumentsHash} from "@/selectors/mineSelectors";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  expectedDocumentStatusOptions: PropTypes.array.isRequired,
  updateExpectedDocument: PropTypes.func.isRequired,
  selectedDocument: PropTypes.object.isRequired,
  mineTSFRequiredReports: PropTypes.array.isRequired,
  fetchMineTailingsRequiredDocuments: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
  expectedDocumentStatusOptions: [],
};

export class MineTailingsInfo extends Component {
  state = {selectedDocument: {}}

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

  componentDidMount() {
    this.props.fetchExpectedDocumentStatusOptions();
    this.props.fetchMineTailingsRequiredDocuments();
  }

  openAddTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }


  handleAddReportSubmit = (value) => {
    const requiredReportLabel = this.props.getMineTSFRequiredDocumentsHash[value.req_document_guid];
    this.props.createMineExpectedDocument(this.props.mine.guid, {document_name: requiredReportLabel, ...value}).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  }

  openAddReportModal(event, onSubmit, title, mineTSFRequiredReports) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title, mineTSFRequiredReports},
      content: modalConfig.ADD_TAILINGS_REPORT
    });
  }

  handleEditReportSubmit = (value) => {
    // this.props.updateMineRecord(this.props.mine.guid, {...value, mine_status: mineStatus}, value.name).then(() =>{
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.exp_document_name = value.tsf_report_name;
    updatedDocument.due_date = value.tsf_report_due_date;
    updatedDocument.received_date = value.tsf_report_received_date;
    updatedDocument.exp_document_status_guid = value.tsf_report_status;
    this.props.updateExpectedDocument(updatedDocument.exp_document_guid, {document: updatedDocument}).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  };

  openEditReportModal(event, onSubmit, title, statusOptions, doc) {
    this.setState({
      selectedDocument: doc
    })
    event.preventDefault();
    const initialValues = {
      "tsf_report_name": doc ? ((doc.exp_document_name === 'None') ? null : doc.exp_document_name) : null,
      "tsf_report_due_date": doc ? ((doc.due_date === 'None') ? null : doc.due_date) : null,
      "tsf_report_received_date": doc ? ((doc.received_date === 'None') ? null : doc.received_date) : null,
      "tsf_report_status": doc ? ((doc.exp_document_status_guid === 'None') ? null : doc.exp_document_status_guid) : null,
    };

    this.props.openModal({
      props: { onSubmit, title, statusOptions, initialValues },
      content: modalConfig.EDIT_TAILINGS_REPORT,
    });
  }

  removeReport = (event, exp_doc_guid) => {
    event.preventDefault();
    this.props.removeExpectedDocument(exp_doc_guid).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  }

  render() {
    const { mine } = this.props;
    return (
      <div>
        <div>
          <br />
          <br />
          {mine.mine_tailings_storage_facility.map((facility, id) => (
            <Row key={id} gutter={16}>
              <Col span={6}>
                <h3>{facility.mine_tailings_storage_facility_name}</h3>
              </Col>
              <Col span={6}>
                <h3 />
              </Col>
            </Row>
            ))}
          <div className="center">
            <Button
              className="full-mobile"
              type="primary"
              onClick={(event) =>
                this.openAddTailingsModal(
                  event,
                  this.handleAddTailingsSubmit,
                  ModalContent.ADD_TAILINGS
                )
              }
            >
              {ModalContent.ADD_TAILINGS}
            </Button>
          </div>
        </div>
        <br />
        <br />
        <div>
          <h3>Reports</h3>
          <br />
          <Row gutter={16} justify="center" align="top">
            <Col span={8}><h5>Name</h5></Col>
            <Col span={4}><h5>Due</h5></Col>
            <Col span={4}><h5>Received</h5></Col>
            <Col span={4}><h5>Status</h5></Col>
            <Col span={4} />
          </Row>
          <hr style={{borderTop:'2px solid #c4cdd5'}} />
          {mine.mine_expected_documents.sort((doc1, doc2) => doc1.due_date > doc2.due_date).map((doc, id) => (
            <div key={id}>
              <Row gutter={16} justify="center" align="top">
                <Col id={`name-${  id}`} span={8}>
                  <h6>{doc.exp_document_name}</h6>
                </Col>
                <Col id={`due-date-${  id}`} span={4}>
                  <h6>{doc.due_date === 'None' ? '-' : doc.due_date}</h6>
                </Col>
                <Col span={4}>
                  <h6>{doc.received_date === 'None' ? '-' : doc.received_date}</h6>
                </Col>
                <Col id={`status-${  id}`} span={4}>
                  <h6>
                    {
                      this.props.expectedDocumentStatusOptions[0] ? 
                          doc.exp_document_status_guid === 'None' ? 
                              this.props.expectedDocumentStatusOptions[0].label
                            : this.props.expectedDocumentStatusOptions.find(x=>x.value === doc.exp_document_status_guid).label
                        : '' }
                  </h6>
                </Col>
                <Col span={4} align="right">
                  <Button
                    ghost
                    type="primary"
                    onClick={(event) =>
                        this.openEditReportModal(
                          event,
                          this.handleEditReportSubmit,
                          ModalContent.EDIT_TAILINGS_REPORT,
                          this.props.expectedDocumentStatusOptions,
                          doc
                        )
                      }
                  >
                    <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
                  </Button>
                  <Popconfirm placement="topLeft" title={`Are you sure you want to delete ${  doc.exp_document_name  }?`} onConfirm={(event) => this.removeReport(event, doc.exp_document_guid)} okText="Delete" cancelText="Cancel">
                    <Button ghost type='primary'>
                      <Icon type="minus-circle" theme="outlined" />
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
              <hr />
            </div>
            ))}
          <div key='0'>
            <Row gutter={16} justify="center" align="top">
              <Col span={8} align="left">
                <Button
                  className="full-mobile"
                  type="secondary"
                  onClick={(event) => 
                    this.openAddReportModal(
                      event,
                      this.handleAddReportSubmit,
                      ModalContent.ADD_TAILINGS_REPORT,
                      this.props.mineTSFRequiredReports
                    )}
                >
+ Add TSF Report
                </Button>
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
    mineTSFRequiredReports : getMineTSFRequiredReports(state),
    getMineTSFRequiredDocumentsHash : getMineTSFRequiredDocumentsHash(state),
  });

const mapDispatchToProps = (dispatch) => bindActionCreators(
    {
      fetchExpectedDocumentStatusOptions,
      updateExpectedDocument,
      fetchMineTailingsRequiredDocuments,
      removeExpectedDocument,
      createMineExpectedDocument
    },
    dispatch
  );


MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
