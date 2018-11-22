import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Button } from 'antd';
import ConditionalButton from '@/components/common/ConditionalButton';
import NullScreen from '@/components/common/NullScreen'; 
import * as ModalContent from '@/constants/modalContent';
import { modalConfig } from '@/components/modalContent/config';
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
  match: PropTypes.object.isRequired
};

const defaultProps = {
  mine: {},
};

class MineTailingsInfo extends Component {
  handleSubmit = (value) => {
    this.props.createTailingsStorageFacility({...value, mine_guid: this.props.mine.guid}).then(() => {
      this.props.closeModal();
      this.props.fetchMineRecordById(this.props.mine.guid);
    })
  }

  openModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title},
      content: modalConfig.ADD_TAILINGS
    });
  }

  render() {
    const { mine } = this.props;
    return (
    <div>
        <Card>
          {mine.mine_tailings_storage_facility.map((facility, id) => {
            return (
              <Row key={id} gutter={16}>
                  <Col span={6} ><h5>{facility.mine_tailings_storage_facility_name}</h5></Col>
                  <Col span={6} ><h5></h5></Col>
              </Row>
                )
              })}
              <div className="right center-mobile"> 
                <Button className="full-mobile" type="primary" onClick={(event) => this.openModal(event, this.handleSubmit, ModalContent.ADD_TAILINGS)}>{ModalContent.ADD_TAILINGS}</Button>
              </div>
        </Card>
        <Card>
          <Row gutter={16}>
            <Col span={6} ><h3>Code-Required Reports</h3></Col>
            <Col span={6} ><h3>Due Date</h3></Col>
            <Col span={6} ><h3>Recieved</h3></Col>
            <Col span={6} ><h3>Review Status</h3></Col>
          </Row>
          {mine.mine_expected_documents.map((doc, id) => {
            return (
              <Row key={id} gutter={16}>
                <Col id={"name-"+id} span={6} ><h5>{doc.exp_document_name}</h5></Col>
                <Col id={"due-date-"+id} span={6} ><h5>{doc.due_date}</h5></Col>
                <Col span={6} ><h5></h5></Col>
                <Col id={"status-"+id} span={6} ><h5>{doc.status}</h5></Col>
              </Row>
            )
          })}
        </Card>
    </div>
    );
  }
}

MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;
export default MineTailingsInfo;