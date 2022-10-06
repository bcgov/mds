import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import PropTypes from "prop-types";
import { Divider } from "antd";
import moment from "moment";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineIncidents,
  createMineIncident,
  updateMineIncident,
  deleteMineIncident,
} from "@common/actionCreators/incidentActionCreator";
import { getMineIncidents } from "@common/selectors/incidentSelectors";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import {
  getDropdownIncidentFollowupActionOptions,
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentStatusCodeOptions,
  getIncidentFollowupActionOptions,
  getDropdownIncidentCategoryCodeOptions,
} from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import MineIncidentTable from "./MineIncidentTable";

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
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  updateMineIncident: PropTypes.func.isRequired,
  deleteMineIncident: PropTypes.func.isRequired,
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
  }

  handleAddMineIncident = (values) => {
    const { number_of_fatalities = 0, number_of_injuries = 0, ...other } = values;
    return this.props
      .createMineIncident(this.props.mineGuid, {
        number_of_fatalities,
        number_of_injuries,
        ...other,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mineGuid);
      });
  };

  handleEditMineIncident = (values) =>
    this.props
      .updateMineIncident(this.props.mineGuid, values.mine_incident_guid, values)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineIncidents(this.props.mineGuid);
      });

  handleDeleteMineIncident = (values) =>
    this.props.deleteMineIncident(this.props.mineGuid, values.mine_incident_guid).then(() => {
      this.props.fetchMineIncidents(this.props.mineGuid);
    });

  parseIncidentIntoFormData = (existingIncident, newIncident) => {
    if (newIncident) {
      return { ...existingIncident };
    }
    return {
      ...existingIncident,
      reported_date: moment(existingIncident.reported_timestamp).format("YYYY-MM-DD"),
      reported_time: moment(existingIncident.reported_timestamp),
      incident_date: moment(existingIncident.incident_timestamp).format("YYYY-MM-DD"),
      incident_time: moment(existingIncident.incident_timestamp),
    };
  };

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
          status_code: "IRS",
          ...this.parseIncidentIntoFormData(existingIncident, newIncident),
          dangerous_occurrence_subparagraph_ids: existingIncident.dangerous_occurrence_subparagraph_ids.map(
            String
          ),
          categories: existingIncident.categories
            ? existingIncident.categories
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .map((c) => c.mine_incident_category_code)
            : [],
        },
        onSubmit,
        afterClose: this.handleCancelMineIncident,
        title,
        mineGuid: this.props.mineGuid,
        followupActionOptions: this.props.followupActionsOptions,
        incidentDeterminationOptions: this.props.incidentDeterminationOptions,
        incidentStatusCodeOptions: this.props.incidentStatusCodeOptions,
        incidentCategoryCodeOptions: this.props.incidentCategoryCodeOptions,
        doSubparagraphOptions: this.props.doSubparagraphOptions,
        inspectors: this.props.inspectors,
        clearOnSubmit: true,
      },
      width: "50vw",
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
          mineGuid={this.props.mineGuid}
          isLoaded={this.state.isLoaded}
          incidents={this.props.mineIncidents}
          followupActions={this.props.followupActions}
          openMineIncidentModal={this.openMineIncidentModal}
          handleEditMineIncident={this.handleEditMineIncident}
          openViewMineIncidentModal={this.openViewMineIncidentModal}
          handleDeleteMineIncident={this.handleDeleteMineIncident}
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
  followupActions: getIncidentFollowupActionOptions(state, true),
  followupActionsOptions: getDropdownIncidentFollowupActionOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
  doSubparagraphOptions: getDangerousOccurrenceSubparagraphOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
      createMineIncident,
      updateMineIncident,
      deleteMineIncident,
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

MineIncidents.propTypes = propTypes;
MineIncidents.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineIncidents);
