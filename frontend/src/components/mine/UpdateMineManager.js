import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Drawer, Form, Button, Col, Row, Select, Input, Card } from 'antd';
import { createPersonnel, getPersonnelList } from '@/actionCreators/personnelActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';

class UpdateMineManager extends Component {
  componentDidMount() {
    this.props.getPersonnelList();
  }
  
  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  
  handleSubmit = (event) => {
    event.preventDefault();
    const firstName = this.firstName.input.value;
    const surname = this.surname.input.value;
    this.props.createPersonnel(firstName, surname).then(() => {
      this.onClose();
    })
  }

  handleSelect = (input) => {
    console.log(input);
  }
  
  render() {
    return (
      <div>
        <Card>
          <Form layout="vertical" ref={ref => this.UpdateMineManager = ref} onSubmit={this.handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mine Manager">
                  <Select
                    showSearch
                    placeholder="Select a person"
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    onSelect={(input) => this.handleSelect(input)}
                  >
                    {this.props.personnelIds.map((id) => {
                      return (<Select.Option key={id} value={id}>
                        {this.props.personnel[id].first_name}
                      </Select.Option>)
                  })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="First Name">
                  <Input onChange={this.handleChange} ref={ref => this.firstName = ref} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Surname">
                  <Input onChange={this.handleChange} ref={ref => this.surname = ref} />
                </Form.Item>
              </Col>
            </Row>
          <div>
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              Cancel
              </Button>
            <Button type="primary" htmlType="submit">Submit</Button>
          </div>
          </Form>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
    personnelIds: getPersonnelIds(state),
  };
};

const WrappedUpdateMineManager = Form.create()(UpdateMineManager)
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelList,
    createPersonnel
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WrappedUpdateMineManager);