import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Button } from 'antd';
import * as ModalContent from '@/constants/modalContent';
import { modalConfig } from '@/components/modalContent/config';
import { GREEN_PENCIL } from '@/constants/assets';
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
  mineStatusOptions: [],
  reportStatusOptions: [],
  updateReport: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
  reportStatusOptions: ['Not Recieved', 'Recieved / Pending Review', 'Review In Progress', 'Accepted', 'Rejected / Waiting On Update'],
};

class MineTailingsInfo extends Component {
  handleAddTailingsSubmit = (value) => {
    this.props.createTailingsStorageFacility({...value, mine_guid: this.props.mine.guid}).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  }

  openAddTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title},
      content: modalConfig.ADD_TAILINGS
    });
  }

  handleEditReportSubmit = (value) => {
    //this.props.updateReport().then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    //})
  }

  openEditReportModal(event, onSubmit, title, statusOptions) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title, statusOptions},
      content: modalConfig.EDIT_TAILINGS_REPORT
    });
  }

  render() {
    const { mine } = this.props;
    return (
    <div>
        <div>
          <br/>
          <br/>
          {mine.mine_tailings_storage_facility.map((facility, id) => {
            return (
              <Row key={id} gutter={16}>
                  <Col span={6}><h3>{facility.mine_tailings_storage_facility_name}</h3></Col>
                  <Col span={6}><h3></h3></Col>
              </Row>
                )
              })}
              <div className="center"> 
                <Button className="full-mobile" type="primary" onClick={(event) => this.openAddTailingsModal(event, this.handleAddTailingsSubmit, ModalContent.ADD_TAILINGS)}>{ModalContent.ADD_TAILINGS}</Button>
              </div>
        </div>
        <br/>
        <br/>
        <div>
            <h3>Reports</h3>
            <br/>
            <Row gutter={16} justify="center" align="top">
                <Col span={8}><h5>Name</h5></Col>
                <Col span={4}><h5>Due</h5></Col>
                <Col span={4}><h5>Recieved</h5></Col>
                <Col span={5}><h5>Status</h5></Col>
                <Col span={2}></Col>
            </Row>
          <hr style={{borderTop:'2px solid #c4cdd5'}}/>
          {mine.mine_expected_documents.map((doc, id) => {
            return (
              <div>
                <Row key={id} gutter={16} justify="center" align="top">
                    <Col id={"name-"+id} span={8}><h6>{doc.exp_document_name}</h6></Col>
                    <Col id={"due-date-"+id} span={4}><h6>{doc.due_date}</h6></Col>
                    <Col span={4}><h6></h6></Col>
                    <Col id={"status-"+id} span={5}><h6>{doc.status}</h6></Col>
                    <Col span={2}>
                        <Button ghost type="primary" onClick={(event) => 
                          this.openEditReportModal(event, this.handleEditReportSubmit, ModalContent.EDIT_TAILINGS_REPORT, this.props.reportStatusOptions)}
                          ><img style={{padding: '5px'}}src={GREEN_PENCIL} /></Button>
                    </Col>
                </Row>
                <hr/>
              </div>
                )
              })}
          </div>
    </div>
    );
  }
}

MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;
export default MineTailingsInfo;