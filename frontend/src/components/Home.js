import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Row } from 'antd';

import { createMineRecord } from '@/actionCreators/mineActionCreator';
import * as router from '@/constants/routes';

export class Home extends Component {

  handleButtonClick() {
    this.props.createMineRecord();
  }

  render() {
    return (
      <div>
        <Card title="Home">
        <Row type="flex">
        <Col span={12}>
        <Link to={router.CREATE_MINE_RECORD}>
          <Button
            type="primary"
            size="large"
          >
            Create A Mine
          </Button>
        </Link>
        </Col>
        <Col span={12}>
        <Link to={router.MINE_DASHBOARD}>
          <Button
            type="primary"
            size="large"
          >
            View Mines
          </Button>
        </Link>
        </Col>
        </Row>
        </Card>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    createMineRecord
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(Home);
