import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string'
import { CreateGuard } from '@/HOC/CreateGuard';
import MineRecordForm from '@/components/Forms/MineRecordForm';
import * as String from '@/constants/strings';

/**
 * @class CreateMine - Component to create a mine record.
 */

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
        this.props.getMineRecords(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE);
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
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" size="large" onClick={this.toggleModal}>
              Create Mine Record
          </Button>
        </div>
        <Modal
          title="Create Mine Record"
          visible={this.state.visible}
          onCancel={this.toggleModal}
          footer={null}
        >
          <MineRecordForm onSubmit={this.handleSubmit} title="Create Mine Record"/>
        </Modal>
      </div>
    );
  }
}

CreateMine.propTypes = propTypes;

export default CreateGuard(CreateMine);
