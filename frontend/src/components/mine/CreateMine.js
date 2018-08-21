import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Input, Button, notification } from 'antd';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getUserAccessData } from '@/selectors/authenticationSelectors';
import { CreateGuard } from '@/HOC/CreateGuard';
import { createMineRecord } from '@/actionCreators/mineActionCreator';
import AddMineRecordForm from './Forms/AddMineRecordForm';
import * as routes from '@/constants/routes';

const propTypes = {
  createMineRecord: PropTypes.func.isRequired,
  userRoles: PropTypes.array.isRequired,
};

const defaultProps = {
  createMineRecord: {},
  userRoles: [],
};

export class CreateMine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null
    };
  }

  handleSubmit = (value) => {
    this.props.createMineRecord(value.mineName).then(() => {
      this.setState({redirectTo: routes.MINE_DASHBOARD.route})
    })
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }
    return (
      <div>
        <h1>Create A Mine Record</h1>
        <Card title="Create Mine Form">
          <AddMineRecordForm onSubmit={this.handleSubmit} />
        </Card>
      </div>
    );
  }
}

CreateMine.propTypes = propTypes;
CreateMine.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    userRoles: getUserAccessData(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateGuard(CreateMine));
