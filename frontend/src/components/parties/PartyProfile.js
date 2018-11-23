import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Tabs, Row, Col, Divider } from 'antd';
import { PHONE, EMAIL } from '@/constants/assets';
import { fetchPartyById } from '@/actionCreators/partiesActionCreator';
import { getParties } from '@/selectors/partiesSelectors';
import Loading from '@/components/common/Loading';
import * as router from '@/constants/routes';

/**
 * @class PartyProfile - profile view for personnel/companies
 */

const TabPane = Tabs.TabPane;

const propTypes = {
  fetchPartyById: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  match: PropTypes.object
};

const defaultProps = {
 parties: {},
};

export class PartyProfile extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchPartyById(id);
  }

  render() {
    const { id } = this.props.match.params;
    const parties = this.props.parties[id];
    if (parties) {
      return (
        <div className="profile">
          <div className="profile__header">
            <div className="inline-flex between">
              <h1>{parties.name}</h1>
              <div className="inline-flex">
                <img src={EMAIL} />
                <h5>{parties.email}</h5>
              </div>
            </div>
            <div className="inline-flex between">
              <h2>Mine Manager</h2>
              <div className="inline-flex">
                <img src={PHONE} />
                <h5>{parties.phone_no}</h5>
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
                <div>
                  <Row type="flex" style={{ textAlign: 'center' }}>
                    <Col span={8}><h2>Mine Name</h2></Col>
                    <Col span={8}><h2>Role</h2></Col>
                    <Col span={8}><h2>date</h2></Col>
                  </Row>
                  <Divider style={{ height: '2px', backgroundColor: '#013366', margin: '0'}} />
                  {parties.mgr_appointment.map((history, i) => {
                    const expiry = (history.expiry_date === '9999-12-31') ? 'PRESENT' : history.expiry_date;
                    return (
                      <div key={i}>
                        <Row type="flex" style={{ textAlign: 'center' }}>
                          <Col span={8}>
                            <Link to={router.MINE_SUMMARY.dynamicRoute(history.mine_guid)}>
                              {history.mine_name}
                            </Link>
                          </Col>
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
    parties: getParties(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchPartyById
  }, dispatch);
};

PartyProfile.propTypes = propTypes;
PartyProfile.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyProfile);
