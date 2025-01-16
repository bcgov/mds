import { Col, Divider, Popconfirm, Row, Typography } from "antd";
import { Link, useHistory, useParams, withRouter } from "react-router-dom";
import React, { FC, useEffect, useState } from "react";
import { bindActionCreators, compose } from "redux";
import { createDam, updateDam } from "@mds/common/redux/actionCreators/damActionCreator";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import Step from "@mds/common/components/forms/Step";
import { connect } from "react-redux";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getDam } from "@mds/common/redux/selectors/damSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { storeDam } from "@mds/common/redux/actions/damActions";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import { EDIT_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import DamForm from "./DamForm";
import { ADD_EDIT_DAM } from "@/constants/forms";
import { IDam, ITailingsStorageFacility } from "@mds/common/interfaces";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { RootState } from "@/App";
import { Feature } from "@mds/common/utils/featureFlag";
import FeatureFlagGuard from "@/components/common/featureFlag.guard";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

interface DamsPageProps {
  tsf: ITailingsStorageFacility;
  storeTsf: typeof storeTsf;
  storeDam: typeof storeDam;
  fetchMineRecordById: ActionCreator<typeof fetchMineRecordById>;
  createDam: ActionCreator<typeof createDam>;
  updateDam: ActionCreator<typeof updateDam>;
  initialValues: IDam;
  userRoles: string[];
}

const DamsPage: React.FC<DamsPageProps> = (props) => {
  const history = useHistory();
  const { tsf, initialValues } = props;
  const { tailingsStorageFacilityGuid, damGuid, mineGuid, parentTSFFormMode, userAction } =
    useParams<{
      tailingsStorageFacilityGuid: string;
      damGuid?: string;
      mineGuid: string;
      parentTSFFormMode: string;
      userAction: string;
    }>();
  const [canEditTSF, setCanEditTSF] = useState(false);
  const isUserActionEdit = userAction === "editDam" || userAction === "newDam";
  const isTSFEditMode = parentTSFFormMode === "edit";

  useEffect(() => {
    setCanEditTSF(
      props.userRoles.some(
        (r) => r === USER_ROLES.role_minespace_proponent || r === USER_ROLES.role_edit_tsf
      )
    );
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
    "associated-dams",
    isTSFEditMode
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

  const handleSave = async (values, newActiveTab) => {
    if (damGuid) {
      const updatedDam = await props.updateDam(damGuid, values);
      handleCompleteSubmit(updatedDam.data);
    } else {
      const newDam = await props.createDam({
        ...values,
        mine_tailings_storage_facility_guid: tailingsStorageFacilityGuid,
      });
      handleCompleteSubmit(newDam.data);
    }
  };

  const renderTitle = () => {
    if (!isUserActionEdit) {
      return "View Dam";
    }

    return damGuid ? "Edit Dam" : "Create Dam";
  };

  return (
    <div>
      <Row>
        <Col span={24}>
          <Typography.Title>{renderTitle()}</Typography.Title>
        </Col>
        <Col span={24}>
          <Popconfirm
            title={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
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
        initialValues={initialValues}
        name={ADD_EDIT_DAM}
        handleSaveData={handleSave}
        handleTabChange={() => { }}
        activeTab="basic-dam-information"
        submitText={`${isUserActionEdit ? "Save and" : ""} Return to Associated Dams`}
        handleCancel={handleBack}
        cancelConfirmMessage={`Are you sure you want to cancel ${tailingsStorageFacilityGuid ? "updating this" : "creating a new"
          } dam?
        All unsaved data on this page will be lost.`}
        reduxFormConfig={{
          touchOnBlur: true,
          destroyOnUnmount: true,
          enableReinitialize: true,
        }}
      >
        {[
          <Step key="basic-dam-information">
            <DamForm
              tsf={tsf}
              dam={initialValues}
              canEditTSF={canEditTSF}
              isEditMode={isTSFEditMode}
              canEditDam={isUserActionEdit}
            />
          </Step>,
        ]}
      </SteppedForm>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  initialValues: getDam(state),
  tsf: getTsf(state),
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createDam, updateDam, fetchMineRecordById, storeTsf, storeDam }, dispatch);

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withRouter(FeatureFlagGuard(Feature.TSF_V2)(DamsPage)) as any
) as FC<DamsPageProps>;
