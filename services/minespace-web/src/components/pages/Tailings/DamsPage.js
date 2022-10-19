import * as Permission from "@/constants/permissions";

import { Col, Divider, Popconfirm, Row, Typography } from "antd";
import { Link, useHistory, useParams, withRouter } from "react-router-dom";
import React, { useEffect } from "react";
import { bindActionCreators, compose } from "redux";
import { createDam } from "@common/actionCreators/damActionCreator";
import { getFormSyncErrors, getFormValues, reduxForm, submit } from "redux-form";

import { ADD_EDIT_DAM } from "@/constants/forms";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import DamForm from "@/components/Forms/tailing/tailingsStorageFacility/dam/DamForm";
import { EDIT_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import PropTypes from "prop-types";
import Step from "@/components/common/Step";
import SteppedForm from "@/components/common/SteppedForm";
import { connect } from "react-redux";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { getDam } from "@common/selectors/damSelectors";
import { getTsf } from "@common/selectors/tailingsSelectors";
import { resetForm } from "@common/utils/helpers";
import { storeDam } from "@common/actions/damActions";
import { storeTsf } from "@common/actions/tailingsActions";

const propTypes = {
  tsf: PropTypes.objectOf(PropTypes.any).isRequired,
  storeTsf: PropTypes.func.isRequired,
  storeDam: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  formErrors: PropTypes.objectOf(PropTypes.any).isRequired,
  submit: PropTypes.func.isRequired,
  createDam: PropTypes.func.isRequired,
};

const DamsPage = (props) => {
  const history = useHistory();
  const { tsf, formValues, formErrors } = props;
  const { tailingsStorageFacilityGuid, damGuid, mineGuid } = useParams();

  useEffect(() => {
    if (!tsf.mine_tailings_storage_facility_guid) {
      (async () => {
        const mine = await props.fetchMineRecordById(mineGuid);
        const existingTsf = mine.data.mine_tailings_storage_facilities?.find(
          (t) => t.mine_tailings_storage_facility_guid === tailingsStorageFacilityGuid
        );
        props.storeTsf(existingTsf);
        const currentDam = existingTsf.dams.find((dam) => dam.dam_guid === damGuid);
        props.storeDam(currentDam);
      })();
    }
  }, []);

  const backUrl = EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
    tailingsStorageFacilityGuid,
    mineGuid,
    "associated-dams"
  );

  const handleSave = async () => {
    if (Object.keys(formErrors).length > 0) {
      props.submit();
      return;
    }
    if (damGuid) {
      // TODO: Update Dam
      console.log("handle update save", formErrors);
    } else {
      const newDam = await props.createDam({
        ...formValues,
        mine_tailings_storage_facility_guid: tailingsStorageFacilityGuid,
      });
      const updatedTsf = { ...tsf, dams: [newDam.data, ...tsf.dams] };
      props.storeTsf(updatedTsf);
      history.push(backUrl);
    }
  };

  const handleBack = () => {
    history.push(backUrl);
  };

  return (
    <div>
      <Row>
        <Col span={24}>
          <Typography.Title>{damGuid ? "Edit Dam" : "Create Dam"}</Typography.Title>
        </Col>
        <Col span={24}>
          <Popconfirm
            title={`Are you sure you want to cancel ${
              tailingsStorageFacilityGuid ? "updating this" : "creating a new"
            } dam?
            All unsaved data on this page will be lost.`}
            onConfirm={handleBack}
            cancelText="No"
            okText="Yes"
            placement="right"
          >
            <Link to={backUrl}>
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {tsf.mine_tailings_storage_facility_name} Dams page
            </Link>
          </Popconfirm>
        </Col>
      </Row>
      <Divider />
      <SteppedForm
        errors={[]}
        handleSaveData={handleSave}
        handleTabChange={() => {}}
        activeTab="basic-dam-information"
        submitText="Save and Return to Associated Dams"
        handleCancel={handleBack}
        cancelConfirmMessage={`Are you sure you want to cancel ${
          tailingsStorageFacilityGuid ? "updating this" : "creating a new"
        } dam?
        All unsaved data on this page will be lost.`}
      >
        {[
          <Step key="basic-dam-information">
            <DamForm tsf={tsf} />
          </Step>,
        ]}
      </SteppedForm>
    </div>
  );
};

DamsPage.propTypes = propTypes;

const mapStateToProps = (state) => ({
  initialValues: getDam(state),
  tsf: getTsf(state),
  formValues: getFormValues(ADD_EDIT_DAM)(state),
  formErrors: getFormSyncErrors(ADD_EDIT_DAM)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createDam, fetchMineRecordById, storeTsf, storeDam, submit }, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: ADD_EDIT_DAM,
    touchOnBlur: true,
    destroyOnUnmount: true,
    enableReinitialize: true,
    onSubmit: () => {
      resetForm(ADD_EDIT_DAM);
    },
  })
)(withRouter(AuthorizationGuard(Permission.IN_TESTING)(DamsPage)));
