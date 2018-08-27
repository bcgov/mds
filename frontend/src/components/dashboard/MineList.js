import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Col, Card, Row } from 'antd';
import * as router from '@/constants/routes';

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  pageData: PropTypes.object.isRequired
};

const defaultProps = {
  mines: {},
  mineIds: [],
  pageData: {}
};

class MineList extends Component {
  render() {
    const { mines, mineIds } = this.props;
    return (
      <div>
      <Card title="Mines">
        <Row type="flex">
          <Col span={4}><strong>MINE_NO</strong></Col>
          <Col span={8}><strong>NAME</strong></Col>
          <Col span={8}><strong>GUID</strong></Col>
          <Col span={4}><strong>ACTION</strong></Col>
        </Row>
        {mineIds.map((id) => {
          return (
            <div style={{ padding: "10px" }} key={id}>
              <Row type="flex">
                <Col span={4}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                <Col span={8}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                <Col span={8}>{mines[id].guid}</Col>
                <Col span={4}>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(id)}>
                    <Button type="primary" size="small" >
                      View
                    </Button>
                  </Link>
                </Col>
              </Row>
            </div>
          )
        })}
      </Card>
      </div>
    );
  }
}

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;