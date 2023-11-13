import { Col, Divider, Popconfirm, Row, Typography } from "antd";
import { Link, useHistory, useParams, withRouter } from "react-router-dom";
import React, { FC, useEffect } from "react";
import { bindActionCreators, compose } from "redux";
import { createDam, updateDam } from "@mds/common/redux/actionCreators/damActionCreator";
import { getFormSyncErrors, getFormValues, InjectedFormProps, reduxForm, submit } from "redux-form";

import { ArrowLeftOutlined } from "@ant-design/icons";
import Step from "@common/components/Step";
import SteppedForm from "@common/components/SteppedForm";
import { connect } from "react-redux";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getDam } from "@mds/common/redux/selectors/damSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { resetForm } from "@common/utils/helpers";
import { storeDam } from "@mds/common/redux/actions/damActions";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import { EDIT_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import DamForm from "./DamForm";
import { ADD_EDIT_DAM } from "@/constants/forms";
import { IDam, ITailingsStorageFacility } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator"
import { RootState } from "@/App";
import { Feature } from "@mds/common";
import FeatureFlagGuard from "@/components/common/featureFlag.guard";

interface DamsPageProps {
  tsf: ITailingsStorageFacility;
  storeTsf: typeof storeTsf;
  storeDam: typeof storeDam;
  fetchMineRecordById: ActionCreator<typeof fetchMineRecordById>;
  formValues: IDam;
  formErrors: any;
  submit: () => void;
  createDam: ActionCreator<typeof createDam>;
  updateDam: ActionCreator<typeof updateDam>;
  initialValues: IDam;
}

const DamsPage: React.FC<InjectedFormProps<IDam> & DamsPageProps> = (props) => {
  const history = useHistory();
  const { tsf, formValues, formErrors, initialValues } = props;
  const { tailingsStorageFacilityGuid, damGuid, mineGuid } = useParams<{
    tailingsStorageFacilityGuid: string;
    damGuid?: string;
    mineGuid: string;
  }>();

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

  const handleBack = () => {
    history.push(backUrl);
  };

  const handleCompleteSubmit = (dam) => {
    const dams = tsf.dams?.filter((tsfDam) => tsfDam.dam_guid !== dam?.dam_guid);
    const updatedTsf = { ...tsf, dams: [dam, ...dams] };
    props.storeTsf(updatedTsf);
    handleBack();
  };

  const handleSave = async () => {
    if (Object.keys(formErrors).length > 0) {
      props.submit();
      return;
    }
    if (damGuid) {
      const updatedDam = await props.updateDam(damGuid, formValues);
      handleCompleteSubmit(updatedDam.data);
    } else {
      const newDam = await props.createDam({
        ...formValues,
        mine_tailings_storage_facility_guid: tailingsStorageFacilityGuid,
      });
      handleCompleteSubmit(newDam.data);
    }
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
            <DamForm tsf={tsf} dam={initialValues} />
          </Step>,
        ]}
      </SteppedForm>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  initialValues: getDam(state),
  tsf: getTsf(state),
  formValues: getFormValues(ADD_EDIT_DAM)(state),
  formErrors: getFormSyncErrors(ADD_EDIT_DAM)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { createDam, updateDam, fetchMineRecordById, storeTsf, storeDam, submit },
    dispatch
  );

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
)(withRouter(FeatureFlagGuard(Feature.TSF_V2)(DamsPage)) as any) as FC<DamsPageProps>;
