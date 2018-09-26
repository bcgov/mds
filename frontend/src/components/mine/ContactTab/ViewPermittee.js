import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LoadingBar from 'react-redux-loading-bar'
import { Modal, Card, Radio } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager, getPersonnelById } from '@/actionCreators/personnelActionCreator';
import { getMineRecordById } from '@/actionCreators/mineActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';
import ConditionalButton from '@/components/common/ConditionalButton';
import AddPermitteeForm from '@/components/Forms/AddPermitteeForm';
import AddPersonnelForm from '@/components/Forms/AddPersonnelForm';
import UpdateMineManagerForm from '@/components/Forms/UpdateMineManagerForm';
import NullScreen from '@/components/common/NullScreen';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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

export class ViewPermittee extends Component {
  state = { modalVisible: false, per: true }

  /**
 * add new personnel (firstName, surname) OR compnay (companyName) to db.
 */
  handlePersonnelSubmit = (values) => {
    this.props.createPersonnel(values).then(() => {
      this.props.getPersonnelList();
    });
  }

  /**
   * change mine manager on record.
   */
  handlePermitteeUpdate = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.setState({ modalVisible: !this.state.modalVisible });
      this.props.getMineRecordById(this.props.mine.guid);
    })
  }

  // temporary check - in the future this table will be seeded with data
  renderCorrectForm() {
    return (
      <div>
        {this.state.per &&
          <AddPersonnelForm onSubmit={this.handleSubmit}/>
        }
        {!this.state.per && 
          <AddPermitteeForm onSubmit={this.handleSubmit}/>
        }
      </div>
    )
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }

  handleChange = (value) => {
   this.setState({per: value.target.value})
  }

  componentDidMount() {
    this.props.getPersonnelList();
    if (this.props.mine.mgr_appointment[0]) {
      this.props.getPersonnelById(this.props.mine.mgr_appointment[0].person_guid);
    }
  }

  render() {
    const { mine } = this.props;
      return (
        <div>
          <Card>
            <table>
              <tbody>
                <tr>
                  <th scope="col"><h4>Permittee</h4></th>
                  <th scope="col"><h4>Permittee Since</h4></th>
                </tr>
                <tr>
                  <td data-label="Permittee"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].full_name : "-"}</p></td>
                  <td data-label="Permittee Since"><p className="p-large">{mine.mgr_appointment[0] ? mine.mgr_appointment[0].effective_date : "-"}</p></td>
                </tr>
              </tbody>
            </table>
            <div className="right center-mobile">
              <ConditionalButton 
                handleAction={this.toggleModal} 
                string="Update Permittee" 
                type="primary"
              />
            </div> 
          </Card>
          <Modal
            title="Update Permittee"
            visible={this.state.modalVisible}
            footer={null}
            onCancel={this.toggleModal}
          >
            <LoadingBar 
              scope="modal" 
              style={{ position: 'absolute', top: '50px', left: 0, backgroundColor: '#B9ADA2', width: '100%', height: '8px', zIndex: 100 }} 
            />
            <div>
              <p className="center">Didn't find what you're looking for? Please add a new party below</p>
            <div className="center">
              <RadioGroup defaultValue={true} size="large" onChange={this.handleChange}>
                <RadioButton value={true}>Person</RadioButton>
                <RadioButton value={false}>Company</RadioButton>
              </RadioGroup>
            </div>
              {this.renderCorrectForm()}
            </div>
          </Modal>
        </div>
      );
    } 
  }

ViewPermittee.propTypes = propTypes;
ViewPermittee.defaultProps = defaultProps;

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

export default connect(mapStateToProps, mapDispatchToProps)(ViewPermittee);