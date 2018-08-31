import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Col, Row, Modal, Button } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager, getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';
import ConditionalButton from '@/components/reusables/ConditionalButton';
import Loading from '@/components/reusables/Loading';
import AddPersonnelForm from '../Forms/AddPersonnelForm';
import UpdateMineManagerForm from '../Forms/UpdateMineManagerForm';
import { MINER, MINER_TWO } from '@/constants/assets';
import NullScreen from '@/components/reusables/NullScreen';

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
  state = { visible: false }

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
      this.props.getMineRecordById(this.props.mine.guid).then(() => {
        this.setState({
          visible: !this.state.visible,
        });
      });
    })
  }

  // temporary check - in the future this table will be seeded with data
  renderMineManagerForm() {
    if (this.props.personnelIds.length === 0) {
      return (<NullScreen primaryMessage="" secondaryMessage="Please add below" img={MINER_TWO}/>)
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
      visible: !this.state.visible,
    });
  }

  componentDidMount() {
    this.props.getPersonnelList();
    if (this.props.mine.mgr_appointment[0]) {
      this.props.getPersonnelById(this.props.mine.mgr_appointment[0].person_guid);
    }
  }

  render() {
    if (this.props.mine.mgr_appointment[0]) {
      return (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <label>Mine Manager</label>
            <div>{this.props.mine.mgr_appointment[0].full_name}</div>
            </Col>
            <Col span={12}>
              <label>Effective date</label>
              <div>{this.props.mine.mgr_appointment[0].effective_date}</div>
            </Col>
          </Row>
          <ConditionalButton handleAction={this.toggleModal} string="Update" type="primary"/>
          <Modal
            title="Update Mine Manager"
            visible={this.state.visible}
            footer={null}
            onCancel={this.toggleModal}
          >
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
          <NullScreen primaryMessage="No Assigned Mine Manager" secondaryMessage="Please add mine manger below" img={MINER} />
          <div className="btn-center"><ConditionalButton handleAction={this.toggleModal} string="Add Mine Manager" type="primary"/></div>
          <Modal
            title="Update Mine Manager"
            visible={this.state.visible}
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