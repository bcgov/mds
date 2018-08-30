import React, { Component } from 'react';
import { Button, Modal, Avatar, Badge, } from 'antd';
import PropTypes from 'prop-types';

import { CreateGuard } from '@/HOC/CreateGuard';
import AddMineRecordForm from '@/components/mine/Forms/AddMineRecordForm';

const propTypes = {
  createMineRecord: PropTypes.func.isRequired,
};

export class CreateMine extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    this.props.createMineRecord(value).then(() => {
      this.setState({
        visible: false,
      });
    })
  }

  toggleModal = () => {
    this.setState({
      visible: !this.state.visible,
    });
  }

  render() {
    return (
      <div>
        <div style={{ padding: "10px" }}>
          <Button type="primary" size="small" onClick={this.toggleModal}>
              Create Mine Record
          </Button>
        </div>
        <Modal
          title="Create A Mine Record"
          visible={this.state.visible}
          onCancel={this.toggleModal}
          footer={null}
        >
          <AddMineRecordForm onSubmit={this.handleSubmit} />
        </Modal>
      </div>
    );
  }
}

CreateMine.propTypes = propTypes;

export default CreateGuard(CreateMine);
