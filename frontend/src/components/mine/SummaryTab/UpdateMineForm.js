import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, Form, Input, Button, notification } from 'antd';

const FormItem = Form.Item;

const propTypes = {
  mineId: PropTypes.string.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
};

const defaultProps = {
  // mineId: '',
};

export class UpdateMineForm extends Component {
  handleSubmit = (event) => {
    event.preventDefault();
    const tenureNumber = this.tenureNumber.input.value;
    if (!tenureNumber) {
      notification.error({message: "Must specify a Tenure Number.", duration: 10});
    } else if (tenureNumber.length != 7) {
      notification.error({message: "Specified number must be exactly 7 digits long.", duration: 10});
    } else {
      this.props.updateMineRecord(this.props.mine.mine_detail[0].mine_no, tenureNumber);
    }
  }

  render() {
    return (
      <div>
        <Card title="Tenure Number Form">
          <Form ref={ref => this.updateMineForm = ref} onSubmit={this.handleSubmit}>
            <FormItem>
              <Input type="text" ref={ref => this.tenureNumber = ref} placeholder="Tenure #"></Input>
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

UpdateMineForm.propTypes = propTypes;
UpdateMineForm.defaultProps = defaultProps;

const WrappedUpdateMineForm = Form.create()(UpdateMineForm);
export default WrappedUpdateMineForm;
