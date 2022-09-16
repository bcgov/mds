import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { flattenObject, resetForm } from "@common/utils/helpers";
import { Link, withRouter } from "react-router-dom";
import { getFormSyncErrors, getFormValues, reduxForm, submit, touch } from "redux-form";
import { Col, Divider, Row, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  addPartyRelationship,
  fetchPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import { getTsf } from "@common/selectors/tailingsSelectors";
import { storeTsf, clearTsf } from "@common/actions/tailingsActions";
import { getEngineersOfRecordOptions } from "@common/reducers/partiesReducer";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  ADD_TAILINGS_STORAGE_FACILITY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
} from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import SteppedForm from "@/components/common/SteppedForm";
import * as Permission from "@/constants/permissions";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import BasicInformation from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";
import Step from "@/components/common/Step";
import { EngineerOfRecord } from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import {
  createTailingsStorageFacility,
  fetchMineRecordById,
  updateTailingsStorageFacility,
} from "../../../../common/actionCreators/mineActionCreator";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
      tab: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  updateTailingsStorageFacility: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  // addPartyRelationship: PropTypes.func.isRequired,
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

  const handleSaveData = async (e, newActiveTab) => {
    if (e) {
      e.preventDefault();
    }
    props.submit(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    const errors = Object.keys(flattenObject(formErrors));
    // TODO: implement saving of EOR
    // if (errors.length === 0) {
    //   props.addPartyRelationship({
    //     mine_guid: match.params.mineGuid,
    //     party_guid: formValues.engineer_of_record.party_guid,
    //     mine_party_appt_type_code: "EOR",
    //     related_guid: match.params.tailingsStorageFacilityGuid,
    //     end_current: true,
    //     start_date: formValues.engineer_of_record.start_date,
    //     end_date: formValues.engineer_of_record.end_date,
    //   });
    // }
    if (errors.length === 0) {
      if (tsfGuid) {
        props.updateTailingsStorageFacility(match.params.mineGuid, tsfGuid, formValues);
      } else {
        const newTsf = await props.createTailingsStorageFacility(match.params.mineGuid, formValues);
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
    }
  };

  const handleTabChange = async (newActiveTab) => {
    const { mineGuid, tailingsStorageFacilityGuid } = match?.params;
    let url;
    if (match.params.tab === "basic-information" && !tsfGuid) {
      // const newTsf = await props.createTailingsStorageFacility(match.params.mineGuid, formValues);
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
          handleSaveDraft={handleSaveData}
          errors={errors}
          activeTab={match.params.tab}
        >
          <Step key="basic-information">
            <BasicInformation />
          </Step>
          <Step key="engineer-of-record">
            <EngineerOfRecord eors={eors} />
          </Step>
          <Step key="qualified-person">
            <div />
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
