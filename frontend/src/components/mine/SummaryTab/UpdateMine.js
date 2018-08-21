import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import AddTenureNumberForm from '../Forms/AddTenureNumberForm';
import { CreateGuard } from '@/HOC/CreateGuard';

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
};

export class UpdateMine extends Component {
  handleSubmit = (value) => {
    this.props.updateMineRecord(this.props.mine.mine_detail[0].mine_no, value.tenureNumber);
  }

  render() {
    return (
      <div>
        <Card title="Tenure Number Form">
          <AddTenureNumberForm onSubmit={this.handleSubmit} />
        </Card>
      </div>
    );
  }
}

UpdateMine.propTypes = propTypes;
UpdateMine.defaultProps = defaultProps;

export default CreateGuard(UpdateMine);
