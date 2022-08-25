import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { flattenObject, formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Link } from "react-router-dom";
import { formValueSelector, getFormSyncErrors, reset, submit, touch } from "redux-form";
import { Col, Divider, Row, Tabs, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import {
  addPartyRelationship,
  fetchPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  ADD_TAILINGS_STORAGE_FACILITY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
} from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import TailingsSummaryForm from "@/components/Forms/tailing/tailingsStorageFacility/TailingsSummaryForm";
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
  formValueSelector: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  getFormSyncErrors: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  // updateTailingsStorageFacility: PropTypes.func.isRequired,
  // createTailingsStorageFacility: PropTypes.func.isRequired,
  addPartyRelationship: PropTypes.func.isRequired,
};

const defaultProps = {
  formErrors: {},
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
  const { mines, match, history, formErrors } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [initialValues, setInitialValues] = useState({});

  const handleFetchData = async () => {
    const { mineGuid, tab, tailingsStorageFacilityGuid } = match?.params;
    await props.fetchPartyRelationships({
      mine_guid: match.params.mineGuid,
      relationships: "party",
      include_permit_contacts: "true",
    });
    if (tailingsStorageFacilityGuid) {
      const tsf = mines[mineGuid].mine_tailings_storage_facilities.find(
        (t) => t.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
      );
      setInitialValues(tsf || {});
    }
    setActiveTab(tab);
    setIsLoaded(true);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  // eslint-disable-next-line consistent-return
  const handleSaveData = (e, values) => {
    e.preventDefault();
    props.submit(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    const errors = Object.keys(flattenObject(formErrors));
    if (errors.length === 0) {
      props.addPartyRelationship({
        mine_guid: match.params.mineGuid,
        party_guid: values.formValues.engineer_of_record.party_guid,
        mine_party_appt_type_code: "EOR",
        related_guid: match.params.tailingsStorageFacilityGuid,
        end_current: true,
        start_date: values.formValues.engineer_of_record.start_date,
        end_date: values.formValues.engineer_of_record.end_date,
      });
    }
    // TODO: implement saving/updating tailings storage facility
    // if (errors.length === 0) {
    //   if (match.params.tailingsStorageFacilityGuid) {
    //     props.updateTailingsStorageFacility(
    //       match.params.mineGuid,
    //       match.params.tailingsStorageFacilityGuid,
    //       ...values,
    //     );
    //   } else {
    //     props.createTailingsStorageFacility(
    //       match.params.mineGuid,
    //       ...values,
    //     );
    //   }
    // }
  };

  const handleTabChange = (newActiveTab) => {
    const { mineGuid, tailingsStorageFacilityGuid } = match?.params;
    let url;
    setActiveTab(newActiveTab);
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
  // TODO: remove large error length check
  const disabledTabs = errors.length > 10000;
  const { mineGuid } = match.params;
  const mineName = mines[mineGuid]?.mine_name || "";
  const title = `Create facility`;

  return (
    (isLoaded && (
      <div>
        <Row>
          <Col span={24}>
            <Typography.Title>{title}</Typography.Title>
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
        <Tabs
          tabPosition="left"
          activeKey={activeTab}
          defaultActiveKey={tabs[0]}
          onChange={(tab) => handleTabChange(tab)}
          className="vertical-tabs"
        >
          {tabs.map((tab) => {
            return (
              <Tabs.TabPane
                tab={formatUrlToUpperCaseString(tab)}
                disabled={disabledTabs}
                key={tab}
                className="vertical-tabs--tabpane"
              >
                <TailingsSummaryForm
                  mineGuid={mineGuid}
                  handleSaveData={handleSaveData}
                  handleTabChange={handleTabChange}
                  initialValues={initialValues}
                />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    )) || <Loading />
  );
};

const selector = formValueSelector(FORM.ADD_TAILINGS_STORAGE_FACILITY);
const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_TAILINGS_STORAGE_FACILITY]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_TAILINGS_STORAGE_FACILITY]?.fields || {},
  mines: getMines(state),
  formErrors: getFormSyncErrors(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
  contacts: selector(state, "contacts"),
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
    },
    dispatch
  );

TailingsSummaryPage.propTypes = propTypes;
TailingsSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(TailingsSummaryPage);
