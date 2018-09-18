import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tabs, Row, Col, Divider, Icon } from 'antd';
import { PHONE, EMAIL } from '@/constants/assets';

import { getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getPersonnel } from '@/selectors/personnelSelectors';
import Loading from '@/components/common/Loading';

const TabPane = Tabs.TabPane;

const propTypes = {
  getPersonnelById: PropTypes.func.isRequired,
  personnel: PropTypes.object.isRequired,
  match: PropTypes.object
};

const defaultProps = {
 personnel: {},
};

export class PersonnelProfile extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.getPersonnelById(id);
  }

  render() {
    const { id } = this.props.match.params;
    const personnel = this.props.personnel[id];
    if (personnel) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1>{personnel.full_name}</h1>
              <div className="inline-flex">
                <img src={EMAIL} />
                <h5>{personnel.email}</h5>
              </div>
            </div>
            <div className="inline-flex between">
              <h2>Mine Manager</h2>
              <div className="inline-flex">
                <img src={PHONE} />
                <h5>{personnel.phone_no}</h5>
              </div>
            </div>
          </div>
          <div className="profile__content">
            <Tabs
              activeKey='history'
              size='large'
              animated={{ inkBar: true, tabPane: false }}
            >
              <TabPane tab="Past History" key="history">
                <div className="antd-list">
                  <Row type="flex" style={{ textAlign: 'center' }}>
                    <Col span={8}><h2>Mine Name</h2></Col>
                    <Col span={8}><h2>Role</h2></Col>
                    <Col span={8}><h2>date</h2></Col>
                  </Row>
                  <Divider style={{ height: '2px', backgroundColor: '#013366', margin: '0'}} />
                  {personnel.mgr_appointment.map((history, i) => {
                    const expiry = (history.expiry_date === '9999-12-31') ? 'PRESENT' : history.expiry_date;
                    return (
                      <div key={i}>
                        <Row type="flex" style={{ textAlign: 'center' }}>
                          <Col span={8}>{history.mine_name}</Col>
                          <Col span={8}>Mine Manager</Col>
                          <Col span={8}>{history.effective_date} - {expiry}</Col>
                        </Row>
                      </div>
                    )
                  })}
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      )
    } else {
      return (<Loading />)
    }
  }
}


const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelById
  }, dispatch);
};

PersonnelProfile.propTypes = propTypes;
PersonnelProfile.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PersonnelProfile);
