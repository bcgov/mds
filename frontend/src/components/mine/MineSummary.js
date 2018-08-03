import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Col, Row } from 'antd';

import { getMineRecord, updateMineRecord } from '@/actionCreators/mineActionCreator';
import { getMines, getMineIds } from '@/selectors/mineSelectors';
import { UpdateMineForm } from './UpdateMineForm';

class MineSummary extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.getMineRecord(id);
  }

  render() {
    const { mines, mineIds } = this.props;
    return (
      <div>
        <h1> Mine Summary </h1>
        <Card title="Mine">
            <Row type="flex">
                <Col span={6}><strong>MINE_NO</strong></Col>
                <Col span={6}><strong>NAME</strong></Col>
                <Col span={6}><strong>GUID</strong></Col>
                <Col span={6}><strong>TENURE</strong></Col>
            </Row>
            {mineIds.map((id) => {
                return (
                <div>
                    <Row type="flex" key={id}>
                        <Col span={6}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : "-"}</Col>
                        <Col span={6}>{mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : "-"}</Col>
                        <Col span={6}>{mines[id].guid}</Col>
                        <Col span={6}>{mines[id].mine_detail[0].mineral_tenure_xref.map((tenure) => {
                          return (
                            <div>{tenure.tenure_number_id}</div>
                          )
                        })}</Col>
                    </Row>
                </div>
                )
                })
            }
        </Card>
        <UpdateMineForm {...this.props} />
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
    getMineRecord,
    updateMineRecord
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MineSummary);
