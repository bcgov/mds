
import { Col, Divider, Row, Typography } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  addDocumentToRelationship,
  addPartyRelationship,
  fetchPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import { bindActionCreators, compose } from "redux";
import { clearTsf, storeTsf } from "@common/actions/tailingsActions";
import {
  createTailingsStorageFacility,
  fetchMineRecordById,
  updateTailingsStorageFacility,
} from "@common/actionCreators/mineActionCreator";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { getFormSyncErrors, getFormValues, reduxForm, submit, touch } from "redux-form";

import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { getEngineersOfRecordOptions } from "@common/reducers/partiesReducer";
import { getMines } from "@common/selectors/mineSelectors";
import { getTsf } from "@common/selectors/tailingsSelectors";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import BasicInformation from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";
import CustomPropTypes from "@/customPropTypes";
import EngineerOfRecord from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";
import QualifiedPerson from "@/components/Forms/tailing/tailingsStorageFacility/QualifiedPerson";
import Loading from "@/components/common/Loading";
import Step from "@/components/common/Step";
import SteppedForm from "@/components/common/SteppedForm";
import {
  ADD_TAILINGS_STORAGE_FACILITY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
} from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  mines: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
      tab: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formErrors: PropTypes.object,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  addDocumentToRelationship: PropTypes.func.isRequired,
  updateTailingsStorageFacility: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  addPartyRelationship: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  eors: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  storeTsf: PropTypes.func.isRequired,
  clearTsf: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  formErrors: {},
  formValues: {},
  initialValues: {},
};

export const TailingsSummaryPage = (props) => {
  const { mines, match, history, formErrors, formValues, eors } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tsfGuid, setTsfGuid] = useState(null);

  const handleFetchData = async () => {
    const { tailingsStorageFacilityGuid } = match?.params;
    await props.fetchPermits(match.params.mineGuid);
    await props.fetchPartyRelationships({
      mine_guid: match.params.mineGuid,
      relationships: "party",
      include_permit_contacts: "true",
    });
    if (tailingsStorageFacilityGuid) {
      if (!props.initialValues.mine_tailings_storage_facility_guid) {
        const mine = await props.fetchMineRecordById(match.params.mineGuid);
        const existingTsf = mine.data.mine_tailings_storage_facilities.find(
          (tsf) => tsf.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
        );
        props.storeTsf(existingTsf);
      }
      setTsfGuid(tailingsStorageFacilityGuid);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleAddDocuments = async (minePartyApptGuid) => {
    await Promise.all(
      uploadedFiles.forEach((document) =>
        props.addDocumentToRelationship(
          { mineGuid: match.params.mineGuid, minePartyApptGuid },
          {
            document_name: document.document_name,
            document_manager_guid: document.document_manager_guid,
          }
        )
      )
    );
    setUploadedFiles([]);
  };

  const handleSaveData = async (e, newActiveTab) => {
    if (e) {
      e.preventDefault();
    }

    props.submit(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    const errors = Object.keys(flattenObject(formErrors));

    if (errors?.length) {
      return;
    }

    switch (match.params.tab) {
      case "basic-information":
        if (tsfGuid) {
          props.updateTailingsStorageFacility(match.params.mineGuid, tsfGuid, formValues);
        } else {
          const newTsf = await props.createTailingsStorageFacility(
            match.params.mineGuid,
            formValues
          );
          await props.clearTsf();
          history.push(
            EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
              newTsf.data.mine_tailings_storage_facility_guid,
              match.params.mineGuid,
              newActiveTab || "engineer-of-record"
            )
          );
          setTsfGuid(newTsf.data.mine_tailings_storage_facility_guid);
        }
        break;
      case "engineer-of-record":
      case "qualified-person":
        const { attr, apptType } = {
          "engineer-of-record": {
            attr: "engineer_of_record",
            apptType: "EOR",
          },
          "qualified-person": {
            attr: "qualified_person",
            apptType: "TQP",
          },
        }[match.params.tab];

        if (!formValues[attr].mine_party_appt_guid) {
          // Only add party relationship if changed
          const relationship = await props.addPartyRelationship({
            mine_guid: match.params.mineGuid,
            party_guid: formValues[attr].party_guid,
            mine_party_appt_type_code: apptType,
            related_guid: match.params.tailingsStorageFacilityGuid,
            start_date: formValues[attr].start_date,
            end_date: formValues[attr].end_date,
            end_current: !!formValues[attr].mine_party_appt_guid,
          });
          if (uploadedFiles.length > 0) {
            await handleAddDocuments(relationship.data.mine_party_appt_guid);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleTabChange = async (newActiveTab) => {
    const { mineGuid, tailingsStorageFacilityGuid } = match?.params;
    let url;

    if (
      (match.params.tab === "basic-information" && !tsfGuid) ||
      match.params.tab === "engineer-of-record"
    ) {
      handleSaveData(null, newActiveTab);
    }
    if (tailingsStorageFacilityGuid) {
      url = EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
        tailingsStorageFacilityGuid,
        mineGuid,
        newActiveTab
      );
    } else {
      url = ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(match.params?.mineGuid, newActiveTab);
    }
    history.push(url);
  };

  const errors = Object.keys(flattenObject(formErrors));
  const { mineGuid } = match.params;
  const mineName = mines[mineGuid]?.mine_name || "";

  return (
    (isLoaded && (
      <div>
        <Row>
          <Col span={24}>
            <Typography.Title>Create facility</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "tailings")}>
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {mineName} Tailings page
            </Link>
          </Col>
        </Row>
        <Divider />
        <SteppedForm
          handleSaveData={handleSaveData}
          handleTabChange={handleTabChange}
          errors={errors}
          activeTab={match.params.tab}
        >
          <Step key="basic-information">
            <BasicInformation />
          </Step>
          <Step key="engineer-of-record">
            <EngineerOfRecord
              eors={eors}
              mineGuid={mineGuid}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
          </Step>
          <Step key="qualified-person">
            <QualifiedPerson />
          </Step>
          <Step key="registry-document">
            <div />
          </Step>
          <Step key="reports">
            <div />
          </Step>
          <Step key="summary">
            <div />
          </Step>
        </SteppedForm>
      </div>
    )) || <Loading />
  );
};

const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_TAILINGS_STORAGE_FACILITY]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_TAILINGS_STORAGE_FACILITY]?.fields || {},
  mines: getMines(state),
  formErrors: getFormSyncErrors(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
  formValues: getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
  initialValues: getTsf(state),
  eors: getEngineersOfRecordOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
      updateTailingsStorageFacility,
      createTailingsStorageFacility,
      fetchMineRecordById,
      addPartyRelationship,
      addDocumentToRelationship,
      submit,
      touch,
      storeTsf,
      clearTsf,
      fetchPermits,
    },
    dispatch
  );

TailingsSummaryPage.propTypes = propTypes;
TailingsSummaryPage.defaultProps = defaultProps;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_TAILINGS_STORAGE_FACILITY,
    touchOnBlur: true,
    touchOnChange: false,
    onSubmit: () => {
      resetForm(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    },
    enableReinitialize: true,
    destroyOnUnmount: true,
  })
)(withRouter(AuthorizationGuard(Permission.IN_TESTING)(TailingsSummaryPage)));
