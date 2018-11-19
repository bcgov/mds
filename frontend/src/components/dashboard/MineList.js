import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Col, Row, Divider } from 'antd';
import * as router from '@/constants/routes';
import NullScreen from '@/components/common/NullScreen';

/**
 * @class MineList - paginated list of mines
 */

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
          <Col span={4}><h2>Mine ID</h2></Col>
          <Col span={6}><h2>Name</h2></Col>
          <Col span={6}><h2>Region</h2></Col>
          <Col span={4}><h2>Permit(s)</h2></Col>
          <Col span={4}><h2>Action</h2></Col>
        </Row>
        <Divider style={{ height: '2px', backgroundColor: '#013366', margin: '0'}}/>

        {mineIds && mineIds.map((id) => {
          return (
            <div key={id}>
              <Row type="flex" style={{ textAlign: 'center' }}>
                <Col id="mine_list_id" span={4}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                <Col id="mine_list_name" span={6}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                <Col id="mine_list_region" span={6}>{mines[id].mine_region[0] ? mines.mine_region[0].region_code : "-"}</Col>
                <Col id="mine_list_permit" span={4}>
                  {mines[id].mine_permit.map((permit) => {
                    return (
                      <div key={permit.permit_guid}>{permit.permit_no }</div>
                    )
                  })}
                </Col>
                <Col id="mine_list_action" span={4}>
                  <Link to={router.MINE_SUMMARY.dynamicRoute(id)}>
                    <Button type="primary" style={{margin: '0'}}>
                      View
                    </Button>
                  </Link>
                </Col>
                <Divider />
              </Row>
            </div>
          )
        })}
        {(mineIds.length === 0) &&
          <NullScreen type="no-results" />
        }
      </div>
    );
  }
}

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;