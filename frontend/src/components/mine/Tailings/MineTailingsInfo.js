import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col } from 'antd';
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
    const { id } = this.props.match.params;
    this.props.updateMineRecord(this.props.mine.guid, value, this.props.mine.mine_detail[0].mine_name).then(() => {
    this.props.fetchMineRecordById(id);
    this.props.closeModal();
    })
  }

  openModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TENURE
    });
  }

  render() {
    const { mine } = this.props;
    // if (mine.mine_tailings) {
    //   return (
    //     <div>
    //       <NullScreen type="generic" />
    //       <div className="center"><ConditionalButton handleAction={(event) => this.openModal(event, this.handleSubmit, ModalContent.ADD_TAILINGS)} string={ModalContent.ADD_TAILINGS} type="primary" /></div>
    //     </div>
    //   )
    // }
    return (
    <div>
        <Card>
        <Row gutter={16}>
                <h5>TSF #1</h5>
            </Row>
        </Card>
        <Card>
            <Row gutter={16}>
                <Col span={6} ><h3>Code-Required Reports</h3></Col>
                <Col span={6} ><h3>Due Date</h3></Col>
                <Col span={6} ><h3>Recieved</h3></Col>
                <Col span={6} ><h3>Review Status</h3></Col>
            </Row>
            {mine.mgr_appointment.map((mgr, id) => {
              return (
                <Row key={id} gutter={16}>
                    <Col span={6} ><h5>{mgr.name}</h5></Col>
                    <Col span={6} ><h5>{mgr.name}</h5></Col>
                    <Col span={6} ><h5>{mgr.name}</h5></Col>
                    <Col span={6} ><h5>{mgr.name}</h5></Col>
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