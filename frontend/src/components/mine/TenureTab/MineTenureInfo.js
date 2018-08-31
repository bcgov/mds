import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AddTenureNumberForm from '../Forms/AddTenureNumberForm';
import ConditionalButton from '@/components/reusables/ConditionalButton';
import NullScreen from '@/components/reusables/NullScreen'; 
import { TENURE } from '@/constants/assets';
import { Modal } from 'antd';

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
};

class MineTenureInfo extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    console.log(value);
    console.log(this.props.mine.guid, value.tenureNumber, this.props.mine.mine_detail[0].mine_name);
    this.props.updateMineRecord(this.props.mine.guid, value.tenureNumber, this.props.mine.mine_detail[0].mine_name);
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
          <ConditionalButton handleAction={this.toggleModal} string="Add Tenure Number" type="primary" />
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
        <h1>Tenure</h1>
        {mine.mineral_tenure_xref.map((tenure) => {
          return (
            <div key={tenure.tenure_number_id}>
              {tenure.tenure_number_id}
            </div>
          )
        })}
        <ConditionalButton handleAction={this.toggleModal} string="Update" type="primary"/>
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