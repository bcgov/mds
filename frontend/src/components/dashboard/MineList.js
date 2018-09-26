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
      <div className="antd-list">
        <Row type="flex" style={{textAlign: 'center'}}>
          <Col span={8}><h2>Mine ID</h2></Col>
          <Col span={8}><h2>Name</h2></Col>
          <Col span={8}><h2>Action</h2></Col>
        </Row>
        <Divider style={{ height: '2px', backgroundColor: '#013366', margin: '0'}}/>
        {mineIds.map((id) => {
          return (
            <div key={id}>
              <Row type="flex" style={{ textAlign: 'center' }}>
                <Col span={8}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                <Col span={8}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                <Col span={8}>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(id)}>
                    <Button type="primary" style={{margin: '0'}}>
                      View
                    </Button>
                  </Link>
                </Col>
              </Row>
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