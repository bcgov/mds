import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Form, Input, Button, notification } from 'antd';

import { updateMineRecord } from '@/actionCreators/mineActionCreator';

const FormItem = Form.Item;

export class UpdateMineForm extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const { id } = this.props.match.params;
    const tenureNumber = this.refs.tenureNumber.input.value;
    if (!tenureNumber) {
      notification.error({message: "Must specify a Tenure Number.", duration: 10});
    } else if (tenureNumber.length != 7) {
      notification.error({message: "Specified number must be exactly 7 digits long.", duration: 10});
    } else {
      this.props.updateMineRecord(id, tenureNumber);
    }
  }

  render() {
    return (
      <div>
        <Card title="Tenure Number Form">
        <Form ref="updateMineForm" onSubmit={this.handleSubmit}>
          <FormItem>
            <Input type="text" ref="tenureNumber" placeholder="Tenure #"></Input>
            <Button type="primary" htmlType="submit">
              Add Tenure Number
            </Button>
          </FormItem>
        </Form>
        </Card>
      </div>
    );
  }
}

const WrappedUpdateMineForm = Form.create()(UpdateMineForm);

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(WrappedUpdateMineForm);
