import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string'

import { CreateGuard } from '@/HOC/CreateGuard';
import AddMineRecordForm from '@/components/Forms/AddMineRecordForm';

const propTypes = {
  getMineRecords: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  createMineRecord: PropTypes.func.isRequired
};

export class CreateMine extends Component {
  state = { visible: false }

  handleSubmit = (value) => {
    this.props.createMineRecord(value).then(() => {
      this.setState({
        visible: false,
      });
    }).then(() => {
      const params = queryString.parse(this.props.location.search);
      if (params.page && params.per_page) {
        this.props.getMineRecords(params.page, params.per_page);
      } else {
        this.props.getMineRecords('1', '25');
      }
    });
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
          <div className="right center-mobile">
            <Button className="full" type="primary" size="large" onClick={this.toggleModal}>
                Create Mine Record
            </Button>
          </div>
        </div>
        <Modal
          title="Create Mine Record"
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
