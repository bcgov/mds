import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Drawer, Form, Button, Col, Row, Select, Input, Card, DatePicker } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager } from '@/actionCreators/personnelActionCreator';
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

  handleManagerSubmit = (event) => {
    event.preventDefault();
    console.log("submitted");
    const person_guid = this.manager.input.value;
    const effectiveDate = this.date.input.value;
    this.props.addMineManager(this.props.mine.guid, person_guid, this.props.mine.mine_detail[0].mine_name, effectiveDate)
  }

  // handleSelect = (input) => {
  // }

  onChange = (date, dateString) =>{
    console.log(date, dateString);
  }
  
  render() {
    return (
      <div>
        <Card>
          <Form layout="vertical" ref={ref => this.UpdateMineManager = ref} onSubmit={this.handleManagerSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Mine Manager">
                  <Select
                    showSearch
                    placeholder="Select a person"
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    ref={ref => this.manager = ref}
                    // onSelect={(input) => this.handleSelect(input)}
                  >
                    {this.props.personnelIds.map((id) => {
                      return (<Select.Option key={id} value={id}>
                        {this.props.personnel[id].full_name}
                      </Select.Option>)
                  })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Select a Start date">
                  <DatePicker ref={ref => this.date = ref} onChange={this.onChange} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit">Submit</Button>
            </Form>

            <Form layout="vertical" ref={ref => this.AddPersonnel = ref} onSubmit={this.handleSubmit}>
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
    createPersonnel,
    addMineManager
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(WrappedUpdateMineManager);