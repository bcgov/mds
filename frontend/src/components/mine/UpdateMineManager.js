import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Drawer, Form, Button, Col, Row, Select, Input } from 'antd';
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
  
  render() {
    return (
      <div>
        <Form layout="vertical" ref={ref => this.UpdateMineManager = ref} onSubmit={this.handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mine Manager">
                <Select
                  showSearch
                  placeholder="Select a person"
                  onChange={() => this.handleChange()}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                {this.props.personnelIds.map((id) => {
                  <Select.Option key={id} value={id}>{this.props.personnel[id].first_name}</Select.Option>
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
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
          }}
        >
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