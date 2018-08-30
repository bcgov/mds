import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    this.props.updateMineRecord(this.props.mine.guid, value.tenureNumber, this.props.mine.mine_detail[0].mine_name);
  }

  render() {
    return (
      <div>
        <AddTenureNumberForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

UpdateMine.propTypes = propTypes;
UpdateMine.defaultProps = defaultProps;

export default CreateGuard(UpdateMine);
