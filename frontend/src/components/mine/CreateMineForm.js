import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createMineRecord } from '../../actionCreators/mineActionCreator';
import { Form, Input, Button } from 'antd';

const FormItem = Form.Item;

// follow https://ant.design/components/form/
export class CreateMineForm extends Component {

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.createMineRecord();
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
          <Input></Input>
          <Button type="primary" htmlType="submit">
            Create Mine
          </Button>
        </FormItem>
      </Form>
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
