import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Divider } from 'antd';
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
        <Row type="flex">
          <Col span={4}><strong>MINE_NO</strong></Col>
          <Col span={4}><strong>NAME</strong></Col>
          <Col span={4}><strong>ACTION</strong></Col>
        </Row>
        <Divider style={{ height: '5px', backgroundColor: '003366'}}/>
        {mineIds.map((id) => {
          return (
            <div style={{ padding: "10px" }} key={id}>
              <Row type="flex">
                <Col span={4}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                <Col span={4}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                <Col span={4}>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(id)}>
                    <Button type="primary">
                      View Mine
                    </Button>
                  </Link>
                </Col>
              </Row>
              <Divider />
            </div>
          )
        })}
      </div>
    );
  }
}

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;