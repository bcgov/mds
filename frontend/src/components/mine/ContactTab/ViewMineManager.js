import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar'
import { Col, Row, Modal, Card, Button } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager, getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';
import ConditionalButton from '@/components/common/ConditionalButton';
import Loading from '@/components/common/Loading';
import AddPersonnelForm from '@/components/Forms/AddPersonnelForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import { MINER, MINER_TWO } from '@/constants/assets';
import NullScreen from '@/components/common/NullScreen';
import * as router from '@/constants/routes';

const propTypes = {
  getPersonnelById: PropTypes.func.isRequired,
  getPersonnelList: PropTypes.func.isRequired,
  createPersonnel: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  getMineRecordById: PropTypes.func.isRequired,
  mine: PropTypes.object.isRequired,
  personnel: PropTypes.object.isRequired,
  personnelIds: PropTypes.array.isRequired
};

const defaultProps = {
  mine: {},
  personnel: {},
  personnelIds: []
};

export class ViewMineManager extends Component {
  state = { modalVisible: false }

  /**
 * add new personnel (firstName, surname) to db.
 */
  handlePersonnelSubmit = (values) => {
    this.props.createPersonnel(values).then(() => {
      this.props.getPersonnelList();
    });
  }

  /**
   * change mine manager on record.
   */
  handleSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.setState({ modalVisible: !this.state.modalVisible });
      this.props.getMineRecordById(this.props.mine.guid);
    })
  }

  // temporary check - in the future this table will be seeded with data
  renderMineManagerForm() {
    if (this.props.personnelIds.length === 0) {
      return (<NullScreen type="manager" small/>)
    } else {
      return (
        <UpdateMineManagerForm
          onSubmit={this.handleSubmit}
          personnel={this.props.personnel}
          personnelIds={this.props.personnelIds}
        />
      )
    }
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }

  componentDidMount() {
    this.props.getPersonnelList();
    if (this.props.mine.mgr_appointment[0]) {
      this.props.getPersonnelById(this.props.mine.mgr_appointment[0].person_guid);
    }
  }

  render() {
    const { mine } = this.props;
    if (this.props.mine.mgr_appointment[0] && this.props.personnelIds[0]) {
      const personnel = this.props.personnel[mine.mgr_appointment[0].person_guid];
      return (
        <div>
          <Card>
            <Row type="flex">
              <Col span={12}><h4>Mine Manager</h4></Col>
              <Col span={12}><h4>Manager Since</h4></Col>
            </Row>
            <Row type="flex">
              <Col span={12}><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></Col>
              <Col span={12}><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></Col>
            </Row>
             <Row type="flex">
              <Col span={12}><h4>Email</h4></Col>
              <Col span={6}><h4>Phone Number</h4></Col>
              <Col span={6}><h4>Ext</h4></Col>
            </Row>
            <Row type="flex">
              <Col span={12}><p className="p-large">{personnel.email}</p></Col>
              <Col span={6}><p className="p-large">{personnel.phone_no}</p></Col>
              <Col span={6}><p className="p-large">{personnel.phone_ext}</p></Col>
            </Row>
            <div className="right">
              <Link to={router.PERSONNEL_PROFILE.dynamicRoute(mine.mgr_appointment[0].person_guid)}>
                <Button type="secondary">View profile</Button>
              </Link>
              <ConditionalButton 
                handleAction={this.toggleModal} 
                string="Update Mine Manager" 
                type="primary"
              />
            </div>
          </Card>
          <Modal
            title="Update Mine Manager"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <LoadingBar 
              scope="modal" 
              style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
            />
            <div>
              {this.renderMineManagerForm()}
              <AddPersonnelForm onSubmit={this.handlePersonnelSubmit} />
            </div>
          </Modal>
        </div>
      );
    } else if (!this.props.mine.mgr_appointment[0]) {
      return (
        <div>
          <NullScreen 
            type='manager'
          />
          <div className="center">
            <ConditionalButton 
              handleAction={this.toggleModal} 
              string="Add Mine Manager"
              type="primary"
             />
          </div>
          <Modal
            title="Add Mine Manager"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <div>
              {this.renderMineManagerForm()}
              <AddPersonnelForm onSubmit={this.handlePersonnelSubmit} />
            </div>
          </Modal>
        </div>
      )
    } else {
      return <Loading />
    }
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
    getPersonnelById,
    getPersonnelList,
    createPersonnel,
    addMineManager,
    getMineRecordById,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMineManager);