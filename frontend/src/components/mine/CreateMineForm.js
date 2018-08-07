import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Input, Button, notification } from 'antd';
import { Redirect } from 'react-router-dom';

import { createMineRecord } from '@/actionCreators/mineActionCreator';
import * as routes from '@/constants/routes';

const FormItem = Form.Item;

export class CreateMineForm extends Component {

  handleSubmit = (event) => {
    event.preventDefault();
    const mineName = this.refs.mineName.input.value;
    if (!mineName) {
      notification.error({message: "Must specify a mine name.", duration: 10});
    } else if (mineName.length > 60) {
      notification.error({message: "Specified name cannot exceed 60 characters.", duration: 10});
    } else {
      this.props.createMineRecord(mineName).then(() => {
        return <Redirect to={routes.MINE_DASHBOARD.route} />
      })
    }
  }

  render() {
    return (
      <div>
        <h1>Create A Mine Record</h1>
        <Card title="Create Mine Form">
        <Form ref="createMineForm" onSubmit={this.handleSubmit}>
          <FormItem>
            <Input type="text" ref="mineName" placeholder="Mine Name"></Input>
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

const WrappedCreateMineForm = Form.create()(CreateMineForm);

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(WrappedCreateMineForm);
