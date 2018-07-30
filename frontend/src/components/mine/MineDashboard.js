import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Col, Card, Row } from 'antd';

import { getMineRecords } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds } from '@/selectors/mineSelectors';
import * as router from '@/constants/routes';

class MineDashboard extends Component {
  componentDidMount() {
    this.props.getMineRecords();
  }

  render() {
    const { mines, mineIds } = this.props;
    return (
      <div>
        <h1> Mine Dashboard </h1>
        <Card title="Mines"
        extra={
        <Link to={router.CREATE_MINE_RECORD}>
        <Button type="primary" size="small" >
        Create A Mine
        </Button>
        </Link>}>
          <Row type="flex">
            <Col span={8}><strong>MINE_NO</strong></Col>
            <Col span={8}><strong>NAME</strong></Col>
            <Col span={8}><strong>GUID</strong></Col>
          </Row>
          {mineIds.map((id) => {
            return (
              <div>
                  <Row type="flex" key={id}>
                    <Col span={8}>{mines[id].mine_details[0] ? mines[id].mine_details[0].mine_no : "-"}</Col>
                    <Col span={8}>{mines[id].mine_details[0] ? mines[id].mine_details[0].mine_name : "-"}</Col>
                    <Col span={8}>{mines[id].guid}</Col>
                  </Row>
              </div>
            )
          })
        }
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mines: getMines(state),
    mineIds: getMineIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getMineRecords
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MineDashboard);
