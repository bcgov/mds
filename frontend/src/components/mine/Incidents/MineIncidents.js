import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import {
  fetchMineIncidents,
  createMineIncident,
  updateMineIncident,
} from "@/actionCreators/mineActionCreator";
import { getMineIncidents } from "@/selectors/mineSelectors";
import {
  getIncidentFollowupActionOptions,
  getDropdownIncidentFollowupActionOptions,
} from "@/selectors/staticContentSelectors";

import MineIncidentTable from "./MineIncidentTable";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsDropdown: PropTypes.arrayOf(CustomPropTypes.dropdownListItem),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
};

const defaultProps = {
  mineIncidents: [],
  followupActions: [],
  followupActionsDropdown: [],
};

export class MineIncidents extends Component {
  componentDidMount() {
    this.props.fetchMineIncidents(this.props.mine.mine_guid);
  }

  handleAddMineIncident = (values) => {
    this.props.createMineIncident(this.props.mine.mine_guid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineIncidents(this.props.mine.mine_guid);
    });
  };

  handleEditMineIncident = (values) => {
    this.props.updateMineIncident(values.mine_incident_guid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineIncidents(this.props.mine.mine_guid);
    });
  };

  openMineIncidentModal = (event, onSubmit, existingIncident = {}) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: existingIncident,
        onSubmit,
        title: ModalContent.ADD_INCIDENT(this.props.mine.mine_name),
        mineGuid: this.props.mine.mine_guid,
        followupActionOptions: this.props.followupActionsDropdown,
      },
      widthSize: "50vw",
      content: modalConfig.MINE_INCIDENT,
    });
  };

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.CREATE}>
            <AddButton
              onClick={(event) => this.openMineIncidentModal(event, this.handleAddMineIncident)}
            >
              Record a Mine Incident
            </AddButton>
          </AuthorizationWrapper>
        </div>
        <MineIncidentTable
          incidents={this.props.mineIncidents}
          followupActions={this.props.followupActions}
          openMineIncidentModal={this.openMineIncidentModal}
          handleEditMineIncident={this.handleEditMineIncident}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineIncidents: getMineIncidents(state),
  followupActions: getIncidentFollowupActionOptions(state),
  followupActionsDropDown: getDropdownIncidentFollowupActionOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
      createMineIncident,
      updateMineIncident,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidents);
