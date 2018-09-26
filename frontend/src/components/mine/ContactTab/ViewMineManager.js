import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Button } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager, getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';
import ConditionalButton from '@/components/common/ConditionalButton';
import Loading from '@/components/common/Loading';
import AddPersonnelForm from '@/components/Forms/AddPersonnelForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import NullScreen from '@/components/common/NullScreen';
import { AutoComplete } from 'antd';
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


  handleChange = (value) => {
    if (value.length > 2){
      this.props.getPersonnelList(value);
    }
    else if (value.length === 0) {
      this.props.getPersonnelList();
    }
  }

  // temporary check - in the future this table will be seeded with data
  renderMineManagerForm() {
    if (this.props.personnelIds.length === 0) {
      return (<NullScreen type="manager" small/>)
    } else {
      return (
        <div>
          <UpdateMineManagerForm
            onSubmit={this.handleSubmit}
            personnel={this.props.personnel}
            personnelIds={this.props.personnelIds}
            handleChange={this.handleChange}
          />
          <p className="center">Didn't find what you're looking for? Please add a new party below</p>
        </div>
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
            <table>
              <tbody>
                <tr>
                  <th scope="col"><h4>Mine Manager</h4></th>
                  <th scope="col"><h4>Manager Since</h4></th>
                </tr>
                <tr>
                  <td data-label="Mine Manager"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                  <td data-label="Manager Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
                </tr>
                <tr>
                  <th scope="col"><h4>Email</h4></th>
                  <th scope="col"><h4>Phone Number (Ext)</h4></th>
                </tr>
                <tr>
                  <td data-label="Email"><p className="p-large">{personnel.email}</p></td>
                  <td data-label="Phone Number (Ext)"><p className="p-large">{personnel.phone_no} ({personnel.phone_ext})</p></td>
                </tr>
              </tbody>
            </table>
            <div className="right center-mobile">
              <Link to={router.PERSONNEL_PROFILE.dynamicRoute(mine.mgr_appointment[0].person_guid)}>
                <Button className="full-mobile" type="secondary">View profile</Button>
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