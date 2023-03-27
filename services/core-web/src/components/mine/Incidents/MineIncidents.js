import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { destroy } from "redux-form";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { closeModal, openModal } from "@common/actions/modalActions";
import {
  createMineIncident,
  deleteMineIncident,
  fetchMineIncidents,
  updateMineIncident,
} from "@common/actionCreators/incidentActionCreator";
import { getIncidentPageData, getIncidents } from "@common/selectors/incidentSelectors";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import {
  getDangerousOccurrenceSubparagraphOptions,
  getDropdownIncidentCategoryCodeOptions,
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentFollowupActionOptions,
  getDropdownIncidentStatusCodeOptions,
  getIncidentFollowupActionOptions,
} from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import { DEFAULT_PER_PAGE, DEFAULT_PAGE } from "@mds/common";
import * as ROUTES from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import MineIncidentTable from "./MineIncidentTable";

/**
 * @component MineIncidents - all incident information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineIncidents: PropTypes.arrayOf(CustomPropTypes.incident),
  incidentPageData: CustomPropTypes.incidentPageData.isRequired,
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
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  mineIncidents: [],
  followupActions: [],
};

const MineIncidents = (props) => {
  const { mineIncidents, mineGuid, mines, incidentPageData } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFetchIncidents = (params) => {
    const fetchParams = params || {
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
      sort_dir: "desc",
      sort_field: "mine_incident_report_no",
    };

    props.fetchMineIncidents({
      ...fetchParams,
      mine_guid: mineGuid,
    });
  };

  useEffect(() => {
    (async () => {
      await handleFetchIncidents();
      setIsLoaded(true);
    })();
  }, []);

  const handleAddMineIncident = (values) => {
    const { number_of_fatalities = 0, number_of_injuries = 0, ...other } = values;
    return props
      .createMineIncident(mineGuid, {
        number_of_fatalities,
        number_of_injuries,
        ...other,
      })
      .then(() => {
        props.closeModal();
        props.fetchMineIncidents(mineGuid);
      });
  };

  const handleEditMineIncident = (values) =>
    props.updateMineIncident(mineGuid, values.mine_incident_guid, values).then(() => {
      props.closeModal();
      props.fetchMineIncidents(mineGuid);
    });

  const handleDeleteMineIncident = (values) =>
    props.deleteMineIncident(mineGuid, values.mine_incident_guid).then(() => {
      props.fetchMineIncidents(mineGuid);
    });

  return (
    <div className="tab__content">
      <div>
        <h2>Incidents and Investigation</h2>
        <Divider />
      </div>
      <div className="inline-flex flex-end">
        <AuthorizationWrapper permission={Permission.EDIT_DO}>
          <AddButton
            onClick={() =>
              props.history.push({
                pathname: ROUTES.CREATE_MINE_INCIDENT.dynamicRoute(mineGuid),
                search: `mine_name=${mines[mineGuid]?.mine_name}`,
              })
            }
          >
            Record a Mine Incident
          </AddButton>
        </AuthorizationWrapper>
      </div>
      <MineIncidentTable
        mineGuid={mineGuid}
        isLoaded={isLoaded}
        incidents={mineIncidents}
        followupActions={props.followupActions}
        handleEditMineIncident={handleEditMineIncident}
        handleDeleteMineIncident={handleDeleteMineIncident}
        pageData={incidentPageData}
        handleUpdate={handleFetchIncidents}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  // mineIncidents: getMineIncidents(state),
  mineIncidents: getIncidents(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  inspectors: getDropdownInspectors(state),
  followupActions: getIncidentFollowupActionOptions(state, true),
  followupActionsOptions: getDropdownIncidentFollowupActionOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
  incidentPageData: getIncidentPageData(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MineIncidents));
