import React, { Component } from 'react';
import { Card, Button, Modal, Avatar, Badge, } from 'antd';
import PropTypes from 'prop-types';

import { CreateGuard } from '@/HOC/CreateGuard';
import AddMineRecordForm from '@/components/mine/Forms/AddMineRecordForm';

const propTypes = {
  createMineRecord: PropTypes.func.isRequired,
};

export class CreateMine extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    this.props.createMineRecord(value.mineName).then(() => {
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
        <Card style={{ textAlign: "center" }}>
          <div>
            <Badge count={"+"}>
              <Avatar shape="square" size="large" icon="database" />
            </Badge>
          </div>
          <div style={{ padding: "10px" }}>
            <Button type="primary" size="small" onClick={this.toggleModal}>
                Create Mine Record
            </Button>
          </div>
        </Card>
        <Modal
          title="Create A Mine Record"
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          footer={null}
          closable={false}
        >
          <AddMineRecordForm onSubmit={this.handleSubmit} handleCancel={this.toggleModal}/>
        </Modal>
      </div>
    );
  }
}

CreateMine.propTypes = propTypes;

export default CreateGuard(CreateMine);
