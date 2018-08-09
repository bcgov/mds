import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Keycloak from 'keycloak-js';
import { Card, Form, Input, Button, notification } from 'antd';
import { Redirect } from 'react-router-dom';

import { createMineRecord } from '@/actionCreators/mineActionCreator';
import * as routes from '@/constants/routes';

const FormItem = Form.Item;

export class CreateMineForm extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      keycloak: null, 
      authenticated: false, 
      redirectTo: null
    };
  }
  componentDidMount() {
    const keycloak = Keycloak({
      "realm": "mds",
      "url": "https://sso-test.pathfinder.gov.bc.ca/auth/",
      "ssl-required": "external",
      "resource": "frontend",
      "public-client": true,
      "confidential-port": 0,
      "clientId": "frontend"
    });
    keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
      console.log(authenticated);
      this.setState({ keycloak: keycloak, authenticated: authenticated });
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const mineName = this.refs.mineName.input.value;
    if (!mineName) {
      notification.error({message: "Must specify a mine name.", duration: 10});
    } else if (mineName.length > 60) {
      notification.error({message: "Specified name cannot exceed 60 characters.", duration: 10});
    } else {
      this.props.createMineRecord(mineName).then(() => {
        this.setState({redirectTo: routes.DASHBOARD.route})
      })
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }
    if (this.state.authenticated) {
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
    } else {
      return (
        <div> not authenticated </div>
      )
    }
  }
}

const WrappedCreateMineForm = Form.create()(CreateMineForm);

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(WrappedCreateMineForm);
