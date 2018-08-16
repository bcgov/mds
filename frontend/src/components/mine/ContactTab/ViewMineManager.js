import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Col, Row, Card } from 'antd';
import { getPersonnelInfo } from '@/actionCreators/personnelActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';


const propTypes = {
  getPersonnelInfo: PropTypes.func.isRequired,
  handleManagerUpdate: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  personnel: PropTypes.object.isRequired,
  personnelIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  personnel: {},
  personnelIds: []
};

class ViewMineManager extends Component {
  componentDidMount() {
    this.props.getPersonnelInfo(this.props.mine.mgr_appointment[0].person_guid);
  }

  render() {
    return (
    this.props.personnelIds.map((id) => {
      return (
        <div key={id}>
            <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <label>Mine Manager</label>
                    <div>{this.props.personnel[id].full_name}</div>
                  </Col>
                  <Col span={12}>
                  <label>Effective date</label>
                    <div>{this.props.personnel[id].effective_date}</div>
                  </Col>
                </Row>
              <Button type="primary" onClick={this.props.handleManagerUpdate}>Update</Button>
            </Card>
        </div>
        );
      })
    );
  }
}

ViewMineManager.propTypes = propTypes;
ViewMineManager.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
    personnelIds: getPersonnelIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelInfo
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMineManager);