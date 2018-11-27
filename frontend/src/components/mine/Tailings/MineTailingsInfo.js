import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, Row, Col, Button, Icon, Popconfirm} from 'antd';
import * as ModalContent from '@/constants/modalContent';
import { modalConfig } from '@/components/modalContent/config';
import { GREEN_PENCIL } from '@/constants/assets';
import ButtonGroup from 'antd/lib/button/button-group';
import {addExpectedDocument ,removeExpectedDocument } from '@/actionCreators/mineActionCreator';
import { fetchExpectedDocumentStatusOptions, fetchMineTailingsRequiredDocuments } from "@/actionCreators/mineActionCreator";
import { getExpectedDocumentStatusOptions, getMineTailingsRequiredDocuments} from "@/selectors/mineSelectors";
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
  mineTSFRequiredReports: PropTypes.array.isRequired,
};

const defaultProps = {
  mine: {},
  expectedDocumentStatusOptions: [
    "Not Recieved",
    "Recieved / Pending Review",
    "Review In Progress",
    "Accepted",
    "Rejected / Waiting On Update",
  ],
  mineTSFRequiredReports: [
    {'value':"Annual Reclamation", 'label':"Annual Reclamation"},
    {'value': "Annual DSI", 'label':"Annual DSI"},
  ]
};

class MineTailingsInfo extends Component {
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
    this.props.addExpectedDocument(...value, this.props.mine.guid).then(() => {
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
    //this.props.updateReport().then(() => {
    this.props.closeModal();
    this.props.fetchMineRecordById(this.props.mine.guid);
    //})
  };

  openEditReportModal(event, onSubmit, title, statusOptions) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title, statusOptions },
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
          {mine.mine_tailings_storage_facility.map((facility, id) => {
            return (
              <Row key={id} gutter={16}>
                <Col span={6}>
                  <h3>{facility.mine_tailings_storage_facility_name}</h3>
                </Col>
                <Col span={6}>
                  <h3 />
                </Col>
              </Row>
            );
          })}
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
            <br/>
            <Row gutter={16} justify="center" align="top">
                <Col span={8}><h5>Name</h5></Col>
                <Col span={4}><h5>Due</h5></Col>
                <Col span={4}><h5>Recieved</h5></Col>
                <Col span={5}><h5>Status</h5></Col>
                <Col span={2}>  
                  <Button ghost type="primary" onClick={(event) => 
                      this.openAddReportModal(
                        event,
                        this.handleAddReportSubmit,
                        ModalContent.ADD_TAILINGS_REPORT,
                        this.props.mineTSFRequiredReports
                      )}
                      ><Icon type="plus-circle" theme="outlined"/>
                  </Button>
                </Col>
            </Row>
          <hr style={{borderTop:'2px solid #c4cdd5'}}/>
          {mine.mine_expected_documents.map((doc, id) => {
            return (
              <div key={id}>
                <Row key={id} gutter={16} justify="center" align="top">
                    <Col id={"name-"+id} span={8}><h6>{doc.exp_document_name}</h6></Col>
                    <Col id={"due-date-"+id} span={4}><h6>{doc.due_date}</h6></Col>
                    <Col span={4}><h6></h6></Col>
                    <Col id={"status-"+id} span={5}><h6>{doc.status}</h6></Col>
                    <Col span={2}>
                      <ButtonGroup>
                    <Button
                      ghost
                      type="primary"
                      onClick={(event) =>
                        this.openEditReportModal(
                          event,
                          this.handleEditReportSubmit,
                          ModalContent.EDIT_TAILINGS_REPORT,
                          this.props.expectedDocumentStatusOptions
                        )
                      }
                    >
                      <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
                    </Button>
                        <Popconfirm placement="topLeft" title={"Are you sure you want to delete " + doc.exp_document_name + "?"} onConfirm={(event) => this.removeReport(event, doc.exp_document_guid)} okText="Delete" cancelText="Cancel">
                          <Button ghost type='primary'>
                            <Icon type="minus-circle" theme="outlined" />
                          </Button>
                        </Popconfirm>
                      </ButtonGroup>
                    </Col>
                </Row>
                <hr />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
    mineTSFRequiredReports : getMineTailingsRequiredDocuments(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchExpectedDocumentStatusOptions,
      fetchMineTailingsRequiredDocuments,
      removeExpectedDocument,
      addExpectedDocument
    },
    dispatch
  );
};


MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
