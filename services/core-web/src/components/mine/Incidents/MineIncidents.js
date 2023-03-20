import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { destroy } from "redux-form";
import PropTypes from "prop-types";
import { Divider } from "antd";
import moment from "moment";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
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
import * as FORM from "@/constants/forms";
import * as ROUTES from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
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

  const parseIncidentIntoFormData = (existingIncident, newIncident) => {
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

  const openViewMineIncidentModal = (event, incident) => {
    const mine = mines[mineGuid];
    event.preventDefault();
    const title = `${mine.mine_name} - Incident No. ${incident.mine_incident_report_no}`;
    props.openModal({
      props: {
        title,
        incident,
      },
      isViewOnly: true,
      content: modalConfig.VIEW_MINE_INCIDENT,
    });
  };

  const handleCancelMineIncident = () => {
    props.destroy(FORM.MINE_INCIDENT);
  };

  const openMineIncidentModal = (
    event,
    onSubmit,
    newIncident,
    existingIncident = { dangerous_occurrence_subparagraph_ids: [] }
  ) => {
    const mine = mines[mineGuid];
    event.preventDefault();
    const title = newIncident
      ? ModalContent.ADD_INCIDENT(mine.mine_name)
      : ModalContent.EDIT_INCIDENT(mine.mine_name);
    props.openModal({
      props: {
        newIncident,
        initialValues: {
          status_code: "WNS",
          ...parseIncidentIntoFormData(existingIncident, newIncident),
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
        afterClose: handleCancelMineIncident,
        title,
        mineGuid,
        followupActionOptions: props.followupActionsOptions,
        incidentDeterminationOptions: props.incidentDeterminationOptions,
        incidentStatusCodeOptions: props.incidentStatusCodeOptions,
        incidentCategoryCodeOptions: props.incidentCategoryCodeOptions,
        doSubparagraphOptions: props.doSubparagraphOptions,
        inspectors: props.inspectors,
        clearOnSubmit: true,
      },
      width: "50vw",
      content: modalConfig.MINE_INCIDENT,
    });
  };

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
              // ENV FLAG FOR MINE INCIDENTS //
              IN_PROD()
                ? openMineIncidentModal(event, handleAddMineIncident, true)
                : props.history.push({
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
        openMineIncidentModal={openMineIncidentModal}
        handleEditMineIncident={handleEditMineIncident}
        openViewMineIncidentModal={openViewMineIncidentModal}
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
