import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import * as FORM from "@/constants/forms";
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
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentStatusCodeOptions,
} from "@/selectors/staticContentSelectors";

import MineIncidentTable from "./MineIncidentTable";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
};

const defaultProps = {
  mineIncidents: [],
  followupActions: [],
};

export class MineIncidents extends Component {
  componentDidMount() {
    this.props.fetchMineIncidents(this.props.mine.mine_guid);
  }

  handleAddMineIncident = (values) => {
    const { number_of_fatalities = 0, number_of_injuries = 0, ...otherValues } = values;
    this.props
      .createMineIncident(this.props.mine.mine_guid, {
        number_of_fatalities,
        number_of_injuries,
        ...otherValues,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mine.mine_guid);
      });
  };

  handleEditMineIncident = (values) => {
    this.props
      .updateMineIncident(this.props.mine.mine_guid, values.mine_incident_guid, values)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mine.mine_guid);
      });
  };

  openViewMineIncidentModal = (event, incident) => {
    event.preventDefault();
    const title = `${this.props.mine.mine_name} - Incident No. ${incident.mine_incident_report_no}`;
    this.props.openModal({
      props: {
        title,
        incident,
      },
      isViewOnly: true,
      content: modalConfig.VIEW_MINE_INCIDENT,
    });
  };

  handleCancelMineIncident = () => {
    this.props.destroy(FORM.MINE_INCIDENT);
  };

  openMineIncidentModal = (
    event,
    onSubmit,
    newIncident,
    existingIncident = { dangerous_occurrence_subparagraph_ids: [] }
  ) => {
    event.preventDefault();
    const title = newIncident
      ? ModalContent.ADD_INCIDENT(this.props.mine.mine_name)
      : ModalContent.EDIT_INCIDENT(this.props.mine.mine_name);
    this.props.openModal({
      props: {
        newIncident,
        initialValues: {
          ...existingIncident,
          dangerous_occurrence_subparagraph_ids: existingIncident.dangerous_occurrence_subparagraph_ids.map(
            String
          ),
        },
        onSubmit,
        afterClose: this.handleCancelMineIncident,
        title,
        mineGuid: this.props.mine.mine_guid,
        followupActionOptions: this.props.followupActionsOptions,
        incidentDeterminationOptions: this.props.incidentDeterminationOptions,
        incidentStatusCodeOptions: this.props.incidentStatusCodeOptions,
        doSubparagraphOptions: this.props.doSubparagraphOptions,
        inspectors: this.props.inspectors,
        clearOnSubmit: true,
      },
      widthSize: "50vw",
      content: modalConfig.MINE_INCIDENT,
    });
  };

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <AuthorizationWrapper permission={Permission.EDIT_DO}>
            <AddButton
              onClick={(event) =>
                this.openMineIncidentModal(event, this.handleAddMineIncident, true)
              }
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
          openViewMineIncidentModal={this.openViewMineIncidentModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineIncidents: getMineIncidents(state),
  followupActions: getIncidentFollowupActionOptions(state),
  followupActionsOptions: getDropdownIncidentFollowupActionOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  doSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
      createMineIncident,
      updateMineIncident,
      destroy,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidents);
