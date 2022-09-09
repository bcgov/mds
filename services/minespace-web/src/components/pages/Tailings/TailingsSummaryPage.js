import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { flattenObject } from "@common/utils/helpers";
import { Link, withRouter } from "react-router-dom";
import { getFormSyncErrors, getFormValues, reduxForm, reset, submit, touch } from "redux-form";
import { Col, Divider, Row, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  addPartyRelationship,
  fetchPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import { getTsf } from "@common/selectors/tailingsSelectors";
import { storeTsf } from "@common/actions/tailingsActions";
import { getEngineersOfRecordOptions } from "@common/reducers/partiesReducer";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  ADD_TAILINGS_STORAGE_FACILITY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
} from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import SteppedForm from "@/components/Forms/tailing/tailingsStorageFacility/SteppedForm";
import * as Permission from "@/constants/permissions";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import BasicInformation from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";
import Step from "@/components/Forms/tailing/tailingsStorageFacility/Step";
import { EngineerOfRecord } from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";
import {
  createTailingsStorageFacility,
  updateTailingsStorageFacility,
} from "../../../../common/actionCreators/mineActionCreator";

const propTypes = {
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }).isRequired,
  submit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  getFormSyncErrors: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  updateTailingsStorageFacility: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  storeTsf: PropTypes.func.isRequired,
  // addPartyRelationship: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  eors: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
};

const defaultProps = {
  formErrors: {},
  formValues: {},
};

const tabs = [
  "basic-information",
  "engineer-of-record",
  "qualified-person",
  "registry-document",
  "reports",
  "summary",
];

export const TailingsSummaryPage = (props) => {
  const { mines, match, history, formErrors, formValues, eors } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialValues, setInitialValues] = useState({});

  const handleFetchData = async () => {
    const { mineGuid, tailingsStorageFacilityGuid } = match?.params;
    await props.fetchPartyRelationships({
      mine_guid: match.params.mineGuid,
      relationships: "party",
      include_permit_contacts: "true",
    });
    if (tailingsStorageFacilityGuid) {
      const tsf = mines[mineGuid].mine_tailings_storage_facilities.find(
        (t) => t.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
      );
      props.storeTsf(tsf);
      setInitialValues(tsf);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleSaveData = (e) => {
    e.preventDefault();
    props.submit(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    const errors = Object.keys(flattenObject(formErrors));
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
      if (match.params.tailingsStorageFacilityGuid) {
        props.updateTailingsStorageFacility(
          match.params.mineGuid,
          match.params.tailingsStorageFacilityGuid,
          formValues
        );
      } else {
        props.createTailingsStorageFacility(match.params.mineGuid, formValues);
      }
    }
  };

  const handleTabChange = (newActiveTab) => {
    const { mineGuid, tailingsStorageFacilityGuid } = match?.params;
    let url;
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
          tabs={tabs}
          handleSaveData={handleSaveData}
          handleTabChange={handleTabChange}
          handleSaveDraft={handleSaveData}
          errors={errors}
          match={match}
        >
          <Step key="basic-information">
            <BasicInformation />
          </Step>
          <Step key="engineer-of-record">
            <EngineerOfRecord initialValues={initialValues} eors={eors} />
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

// const selector = formValueSelector(FORM.ADD_TAILINGS_STORAGE_FACILITY);
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
      addPartyRelationship,
      submit,
      reset,
      touch,
      storeTsf,
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
    onSubmit: () => {},
    enableReinitialize: true,
  })
)(withRouter(AuthorizationGuard(Permission.IN_TESTING)(TailingsSummaryPage)));
