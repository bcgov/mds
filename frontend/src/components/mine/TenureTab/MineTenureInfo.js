import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AddTenureNumberForm from '../Forms/AddTenureNumberForm';
import ConditionalButton from '@/components/reusables/ConditionalButton';
import NullScreen from '@/components/reusables/NullScreen'; 
import { TENURE } from '@/constants/assets';
import { Modal, Card, Row, Col } from 'antd';

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  getMineRecordById: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineTenureInfo extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    const { id } = this.props.match.params;
    this.props.updateMineRecord(this.props.mine.guid, value.tenureNumber, this.props.mine.mine_detail[0].mine_name).then(() => {
      this.props.getMineRecordById(id);
      this.setState({
        visible: !this.state.visible,
      });
    })
  }

  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  }

  render() {
    const { mine } = this.props;

    if (mine.mineral_tenure_xref.length === 0) {
      return (
        <div>
          <NullScreen 
            primaryMessage="No data at this time" secondaryMessage="Please add tenure number below" 
            img={TENURE} 
          />
          <div className="btn-center"><ConditionalButton handleAction={this.toggleModal} string="Add Tenure Number" type="primary" /></div>
          <Modal
            title="Update Mine Manager"
            visible={this.state.visible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <AddTenureNumberForm onSubmit={this.handleSubmit} />
          </Modal>
        </div>
      )
    }
    return (
      <div>
        <Card>
          <Row type="flex">
            <Col span={12}><h4>Tenure Numbers</h4></Col>
          </Row>
          <Row type="flex">
          <Col span={12}><p className="p-large">
            {mine.mineral_tenure_xref.map((tenure) => {
              return (
                <div key={tenure.tenure_number_id}>
                  {tenure.tenure_number_id}
                </div>
              )
            })}
            </p></Col>
          </Row>
          <div className="btn-right"><ConditionalButton handleAction={this.toggleModal} string="Update" type="primary" /></div>
        </Card>
        <Modal
          title="Update Mine Manager"
          visible={this.state.visible}
          footer={null}
          onCancel={this.toggleModal}
        >
          <AddTenureNumberForm onSubmit={this.handleSubmit} />
        </Modal>
      </div>
    );
  }
}

MineTenureInfo.propTypes = propTypes;
MineTenureInfo.defaultProps = defaultProps;
export default MineTenureInfo;