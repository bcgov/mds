import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Drawer, Form, Button, Col, Row, Select, Input, Card, DatePicker } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager } from '@/actionCreators/personnelActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';

const propTypes = {
  getPersonnelList: PropTypes.func.isRequired,
  createPersonnel: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  handleManagerUpdate: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  personnel: PropTypes.object.isRequired,
  personnelIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  personnel: {},
  personnelIds: []
};

class UpdateMineManager extends Component {
  state = {
    date: '',
    managerId: '',
  }

  componentDidMount() {
    this.props.getPersonnelList();
  }
  
  handlePersonnelSubmit = (event) => {
    event.preventDefault();
    const firstName = this.firstName.input.value;
    const surname = this.surname.input.value;
    this.props.createPersonnel(firstName, surname).then(() => {
      this.props.getPersonnelList();
    });
  }

  handleManagerSubmit = (event) => {
    event.preventDefault();
    this.props.addMineManager(this.props.mine.guid, this.state.managerId, this.props.mine.mine_detail[0].mine_name, this.state.date).then(() => {
      this.props.handleManagerUpdate();
    })
  }

  handleSelect = (input) => {
    this.setState({ managerId: input });
  }

  onChange = (date, dateString) =>{
    this.setState({ date: dateString })
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
                    onSelect={(input) => this.handleSelect(input)}
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
                  <DatePicker onChange={this.onChange} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit">Update Mine Manager</Button>
            </Form>

            <Form layout="vertical" ref={ref => this.AddPersonnel = ref} onSubmit={this.handlePersonnelSubmit}>
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
            <Button type="primary" htmlType="submit">Create Personnel</Button>
          </Form>
          <Button type="primary" onClick={this.props.handleManagerUpdate}>Cancel</Button>
        </Card>
      </div>
    );
  }
}

UpdateMineManager.propTypes = propTypes;
UpdateMineManager.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
    personnelIds: getPersonnelIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelList,
    createPersonnel,
    addMineManager
  }, dispatch);
}

const WrappedUpdateMineManager = Form.create()(UpdateMineManager)
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUpdateMineManager);