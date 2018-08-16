import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Input, Button, notification } from 'antd';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getUserAccessData } from '@/selectors/authenticationSelectors';
import { USER_ROLES } from '@/constants/environment';
import { CreateGuard } from '@/HOC/CreateGuard';
import { createMineRecord } from '@/actionCreators/mineActionCreator';
import * as routes from '@/constants/routes';

const FormItem = Form.Item;

const propTypes = {
  createMineRecord: PropTypes.func.isRequired,
  userRoles: PropTypes.array.isRequired,
};

const defaultProps = {
  createMineRecord: {},
  userRoles: [],
};

export class CreateMineForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const mineName = this.mineName.input.value;
    if (!mineName) {
      notification.error({message: "Must specify a mine name.", duration: 10});
    } else if (mineName.length > 60) {
      notification.error({message: "Specified name cannot exceed 60 characters.", duration: 10});
    } else {
      this.props.createMineRecord(mineName).then(() => {
        this.setState({redirectTo: routes.MINE_DASHBOARD.route})
      })
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }
    return (
      <div>
        <h1>Create A Mine Record</h1>
        <Card title="Create Mine Form">
          <Form ref={ref => this.createMineForm = ref} onSubmit={this.handleSubmit}>
            <FormItem>
              <Input type="text" ref={ref => this.mineName = ref} placeholder="Mine Name"></Input>
              <Button type="primary" htmlType="submit">
                Create Mine
              </Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    );
  }
}

CreateMineForm.propTypes = propTypes;
CreateMineForm.defaultProps = defaultProps;

const WrappedCreateMineForm = Form.create()(CreateMineForm);

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateGuard(WrappedCreateMineForm));
