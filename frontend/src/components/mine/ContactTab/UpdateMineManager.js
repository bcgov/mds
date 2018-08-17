/**
 * @class UpdateMineManager.js contains and dispatches ations for the UpdateMineManagerForm & AddPersonnelForm.
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Card } from 'antd';
import { createPersonnel, getPersonnelList, addMineManager } from '@/actionCreators/personnelActionCreator';
import { getMineRecord } from '@/actionCreators/mineActionCreator';
import { getPersonnel, getPersonnelIds } from '@/selectors/personnelSelectors';
import AddPersonnelForm from '../Forms/AddPersonnelForm';
import UpdateMineManagerForm from '../Forms/UpdateMineManagerForm';


const propTypes = {
  getPersonnelList: PropTypes.func.isRequired,
  createPersonnel: PropTypes.func.isRequired,
  addMineManager: PropTypes.func.isRequired,
  getMineRecord: PropTypes.func.isRequired,
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

class UpdateMineManager extends Component {
  componentDidMount() {
    this.props.getPersonnelList();
  }
  
  handlePersonnelSubmit = (values) => {
    this.props.createPersonnel(values).then(() => {
      this.props.getPersonnelList();
    });
  }
  
  handleSubmit = (values) => {
    this.props.addMineManager(this.props.mine.guid, values.mineManager, this.props.mine.mine_detail[0].mine_name, values.startDate).then(() => {
      this.props.getMineRecord(this.props.mine.guid).then(() => {
        this.props.handleManagerUpdate();
      });
    })
  }

  render() {
    return (
      <div>
        <Card>
          <UpdateMineManagerForm 
            onSubmit={this.handleSubmit} 
            personnel={this.props.personnel}
            personnelIds={this.props.personnelIds}
          />
          <AddPersonnelForm onSubmit={this.handlePersonnelSubmit} />
          <Button 
            type="primary" 
            onClick={this.props.handleManagerUpdate}>Cancel
          </Button>
        </Card>
      </div>
    );
  }
}

UpdateMineManager.propTypes = propTypes;
UpdateMineManager.defaultProps = defaultProps;

const mapStateToProps = (state) => {
  return {
    personnel: getPersonnel(state),
    personnelIds: getPersonnelIds(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    getPersonnelList,
    createPersonnel,
    addMineManager,
    getMineRecord,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateMineManager)



