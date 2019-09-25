import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import PropTypes from "prop-types";
import { Divider } from "antd";
import moment from "moment";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import {
  fetchMineIncidents,
  createMineIncident,
  updateMineIncident,
} from "@/actionCreators/incidentActionCreator";
import { getMineIncidents } from "@/selectors/incidentSelectors";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import {
  getDropdownIncidentFollowupActionOptions,
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentStatusCodeOptions,
  getIncidentFollowupActionOptions,
} from "@/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@/selectors/partiesSelectors";

import MineIncidentTable from "./MineIncidentTable";
import {
  fetchIncidentDocumentTypeOptions,
  fetchMineIncidentFollowActionOptions,
  fetchMineIncidentDeterminationOptions,
  fetchMineIncidentStatusCodeOptions,
} from "@/actionCreators/staticContentActionCreator";

/**
 * @class  MineIncidents - all incident information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
  followupActions: PropTypes.arrayOf(CustomPropTypes.incidentFollowupType),
  followupActionsOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  fetchIncidentDocumentTypeOptions: PropTypes.func.isRequired,
  fetchMineIncidentFollowActionOptions: PropTypes.func.isRequired,
  fetchMineIncidentDeterminationOptions: PropTypes.func.isRequired,
  fetchMineIncidentStatusCodeOptions: PropTypes.func.isRequired,
};

const defaultProps = {
  mineIncidents: [],
  followupActions: [],
};

export class MineIncidents extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineIncidents(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
    this.props.fetchIncidentDocumentTypeOptions();
    this.props.fetchMineIncidentFollowActionOptions();
    this.props.fetchMineIncidentDeterminationOptions();
    this.props.fetchMineIncidentStatusCodeOptions();
  }

  handleAddMineIncident = (values) => {
    const { number_of_fatalities = 0, number_of_injuries = 0, ...otherValues } = values;
    this.props
      .createMineIncident(this.props.mineGuid, {
        number_of_fatalities,
        number_of_injuries,
        ...otherValues,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mineGuid);
      });
  };

  handleEditMineIncident = (values) => {
    this.props
      .updateMineIncident(this.props.mineGuid, values.mine_incident_guid, values)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mineGuid);
      });
  };

  parseIncidentIntoFormData = (existingIncident) => ({
    ...existingIncident,
    reported_date: moment(existingIncident.reported_timestamp).format("YYYY-MM-DD"),
    reported_time: moment(existingIncident.reported_timestamp),
    incident_date: moment(existingIncident.incident_timestamp).format("YYYY-MM-DD"),
    incident_time: moment(existingIncident.incident_timestamp),
  });

  openViewMineIncidentModal = (event, incident) => {
    const mine = this.props.mines[this.props.mineGuid];
    event.preventDefault();
    const title = `${mine.mine_name} - Incident No. ${incident.mine_incident_report_no}`;
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
    const mine = this.props.mines[this.props.mineGuid];
    event.preventDefault();
    const title = newIncident
      ? ModalContent.ADD_INCIDENT(mine.mine_name)
      : ModalContent.EDIT_INCIDENT(mine.mine_name);
    this.props.openModal({
      props: {
        newIncident,
        initialValues: {
          status_code: "PRE",
          ...this.parseIncidentIntoFormData(existingIncident),
          dangerous_occurrence_subparagraph_ids: existingIncident.dangerous_occurrence_subparagraph_ids.map(
            String
          ),
        },
        onSubmit,
        afterClose: this.handleCancelMineIncident,
        title,
        mineGuid: this.props.mineGuid,
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
      <div className="tab__content">
        <div>
          <h2>Incidents and Investigation</h2>
          <Divider />
        </div>
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
          isLoaded={this.state.isLoaded}
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
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  inspectors: getDropdownInspectors(state),
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
      fetchIncidentDocumentTypeOptions,
      fetchMineIncidentFollowActionOptions,
      fetchMineIncidentDeterminationOptions,
      fetchMineIncidentStatusCodeOptions,
      createMineIncident,
      updateMineIncident,
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineIncidents);
