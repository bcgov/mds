/**
 * @class Dasboard is the main landing page of the application, currently containts a list of viewable mines and the ability to add a new mine.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Badge, Button, Col, Card, Row } from 'antd';

import { getMineRecords } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds } from '@/selectors/mineSelectors';
import * as router from '@/constants/routes';

const propTypes = {
  getMineRecords: PropTypes.func.isRequired,
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
};

const defaultProps = {
  mines: {},
  mineIds: [],
};

class Dashboard extends Component {
  componentDidMount() {
    this.props.getMineRecords();
  }

  render() {
    const { mines, mineIds } = this.props;
    return (
      <div>
        <h1> Mine Dashboard </h1>
        <Card style={{ textAlign: "center" }}>
          <Link to={router.CREATE_MINE_RECORD.route}>
            <div>
              <Badge count={"+"}>
                <Avatar shape="square" size="large" icon="database" />
              </Badge>
            </div>
            <div style={{ padding: "10px" }}>
              <Button type="primary" size="small" >
                Create Mine Record
            </Button>
            </div>
          </Link>
        </Card>
        <Card title="Mines">
          <Row type="flex">
            <Col span={4}><strong>MINE_NO</strong></Col>
            <Col span={8}><strong>NAME</strong></Col>
            <Col span={8}><strong>GUID</strong></Col>
            <Col span={4}><strong>ACTION</strong></Col>
          </Row>
          {mineIds.map((id) => {
            return (
              <div style={{padding: "10px"}} key={id}>
                <Row type="flex">
                  <Col span={4}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                  <Col span={8}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                  <Col span={8}>{mines[id].guid}</Col>
                  <Col span={4}>
                    <Link to={router.MINE_SUMMARY.dynamicRoute(mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "")}>
                      <Button type="primary" size="small" >
                        View
                      </Button>
                    </Link>
                  </Col>
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

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
