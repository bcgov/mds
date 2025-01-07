import { Col, Divider, Row, Typography } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { FC, useContext, useEffect, useState } from "react";
import {
  addDocumentToRelationship,
  addPartyRelationship,
  fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { bindActionCreators, compose } from "redux";
import { clearTsf, storeTsf } from "@mds/common/redux/actions/tailingsActions";
import {
  createTailingsStorageFacility,
  fetchMineRecordById,
  fetchTailingsStorageFacility,
  updateTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { isDirty } from "redux-form";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import BasicInformation from "@mds/common/components/tailings/BasicInformation";
import Step from "@mds/common/components/forms/Step";
import SteppedForm from "@mds/common/components/forms/SteppedForm";
import { connect } from "react-redux";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import EngineerOfRecord from "@common/components/tailings/EngineerOfRecord";
import TailingsContext from "@common/components/tailings/TailingsContext";
import QualifiedPerson from "@common/components/tailings/QualifiedPerson";
import AssociatedDams from "@common/components/tailings/AssociatedDams";
import {
  getEngineersOfRecord,
  getEngineersOfRecordOptions,
  getQualifiedPersons,
} from "@mds/common/redux/selectors/partiesSelectors";
import {
  ICreateTailingsStorageFacility,
  IMine,
  ITailingsStorageFacility,
  MinePartyAppointmentTypeCodeEnum,
} from "@mds/common";
import { Feature } from "@mds/common";
import FeatureFlagGuard from "@/components/common/featureFlag.guard";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";

interface TailingsSummaryPageProps {
  form: string;
  mineGuid: string;
  tsfGuid: string;
  tab: string;
  mines?: IMine[];
  history?: { push: (path: string) => void; replace: (path: string) => void };
  location?: { pathname: string };
  fetchPartyRelationships?: ActionCreator<typeof fetchPartyRelationships>;
  addDocumentToRelationship?: ActionCreator<typeof addDocumentToRelationship>;
  updateTailingsStorageFacility?: ActionCreator<typeof updateTailingsStorageFacility>;
  createTailingsStorageFacility?: ActionCreator<typeof createTailingsStorageFacility>;
  fetchTailingsStorageFacility?: ActionCreator<typeof fetchTailingsStorageFacility>;
  addPartyRelationship?: ActionCreator<typeof addPartyRelationship>;
  fetchPermits?: ActionCreator<typeof fetchPermits>;
  fetchMineRecordById?: ActionCreator<typeof fetchMineRecordById>;
  storeTsf?: typeof storeTsf;
  clearTsf?: typeof clearTsf;
  isDirty?: (form: string) => boolean;
  initialValues?: Partial<ITailingsStorageFacility>;
  userRoles?: string[];
  userAction: string;
}

export const TailingsSummaryPage: FC<TailingsSummaryPageProps> = (props) => {
  const { mines, history, mineGuid, tsfGuid, tab, userAction = "edit" } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [canEditTSF, setCanEditTSF] = useState(false);
  const { renderConfig, components, routes, isCore } = useContext(TailingsContext);
  const { Loading } = components;

  const isUserActionEdit = userAction === "edit";

  const handleFetchData = async (forceReload = false) => {
    setIsReloading(true);
    await props.fetchPermits(mineGuid);

    if (tsfGuid) {
      if (!props.initialValues.mine_tailings_storage_facility_guid || forceReload) {
        await Promise.all([
          props.fetchMineRecordById(mineGuid),
          props.fetchTailingsStorageFacility(mineGuid, tsfGuid),
        ]);

        await props.fetchPartyRelationships({
          mine_guid: mineGuid,
          relationships: "party",
          include_permit_contacts: "true",
          mine_tailings_storage_facility_guid: tsfGuid,
        });
      }
    }
    setIsLoaded(true);
    setIsReloading(false);
  };

  useEffect(() => {
    handleFetchData(true);
  }, [mineGuid, tsfGuid]);

  useEffect(() => {
    setCanEditTSF(
      props.userRoles.some(
        (r) => r === USER_ROLES.role_minespace_proponent || r === USER_ROLES.role_edit_tsf
      )
    );
  }, []);

  const handleAddDocuments = async (minePartyApptGuid) => {
    await Promise.all(
      uploadedFiles.map((document) =>
        props.addDocumentToRelationship(
          { mineGuid, minePartyApptGuid },
          {
            document_name: document.document_name,
            document_manager_guid: document.document_manager_guid,
          }
        )
      )
    );
    setUploadedFiles([]);
  };

  const handleSaveData = async (values, newActiveTab) => {
    let newTsf = null;

    switch (tab) {
      case "basic-information":
        if (tsfGuid) {
          if (props.isDirty) {
            await props.updateTailingsStorageFacility(mineGuid, tsfGuid, values);
          }
        } else {
          newTsf = await props.createTailingsStorageFacility(
            mineGuid,
            values as ICreateTailingsStorageFacility
          );
          await props.clearTsf();
        }
        break;
      case "engineer-of-record":
      case "qualified-person":
        if (!props.isDirty) {
          break;
        }

        const { attr, apptType, successMessage } = {
          "engineer-of-record": {
            attr: "engineer_of_record",
            apptType: MinePartyAppointmentTypeCodeEnum.EOR,
            successMessage: "Successfully assigned Engineer of Record",
          },
          "qualified-person": {
            attr: "qualified_person",
            apptType: MinePartyAppointmentTypeCodeEnum.TQP,
            successMessage: "Successfully assigned Qualified Person",
          },
        }[tab];

        if (!values[attr].mine_party_appt_guid && values[attr].party_guid) {
          // Only add party relationship if changed
          const relationship = await props.addPartyRelationship(
            {
              mine_guid: mineGuid,
              party_guid: values[attr].party_guid,
              mine_party_appt_type_code: apptType,
              related_guid: tsfGuid,
              start_date: values[attr].start_date,
              end_date: values[attr].end_date,
              end_current: true,
            },
            successMessage
          );

          if (uploadedFiles.length > 0) {
            await handleAddDocuments(relationship.data.mine_party_appt_guid);
          }

          await handleFetchData(true);
        }
        break;
      default:
        break;
    }

    history.push(
      routes.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
        newTsf?.data.mine_tailings_storage_facility_guid || tsfGuid,
        mineGuid,
        newActiveTab || "engineer-of-record",
        isUserActionEdit
      )
    );
  };

  const handleTabChange = async (newActiveTab) => {
    let url;

    if (tsfGuid) {
      url = routes.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
        tsfGuid,
        mineGuid,
        newActiveTab,
        isUserActionEdit
      );
    } else {
      url = routes.ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(newActiveTab);
    }
    history.push(url);
  };

  const mineName = mines[mineGuid]?.mine_name || "";
  const hasCreatedTSF = !!props.initialValues?.mine_tailings_storage_facility_guid;

  return (
    (isLoaded && (
      <div>
        <Row>
          <Col span={24}>
            <Typography.Title>
              {hasCreatedTSF
                ? props.initialValues.mine_tailings_storage_facility_name
                : "Create facility"}
            </Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={routes.MINE_DASHBOARD.dynamicRoute(mineGuid, "tailings")}>
              <ArrowLeftOutlined className="padding-sm--right" />
              {`Back to: ${mineName} Tailings`}
            </Link>
          </Col>
        </Row>
        <Divider />
        <SteppedForm
          initialValues={props.initialValues}
          name={props.form}
          handleSaveData={handleSaveData}
          handleTabChange={handleTabChange}
          activeTab={tab}
          sectionChangeText={canEditTSF && isUserActionEdit ? undefined : "Continue"}
          reduxFormConfig={{
            touchOnBlur: true,
            touchOnChange: false,
            enableReinitialize: true,
            destroyOnUnmount: true,
          }}
        >
          <Step key="basic-information">
            <BasicInformation
              mineName={mineName}
              renderConfig={renderConfig}
              canEditTSF={canEditTSF}
              isEditMode={isUserActionEdit}
            />
          </Step>
          <Step key="engineer-of-record" disabled={!hasCreatedTSF}>
            <EngineerOfRecord
              formType={props.form}
              loading={isReloading}
              mineGuid={mineGuid}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              canEditTSF={canEditTSF}
              isEditMode={isUserActionEdit}
            />
          </Step>
          <Step key="qualified-person" disabled={!hasCreatedTSF}>
            <QualifiedPerson
              tsfFormName={props.form}
              loading={isReloading}
              mineGuid={mineGuid}
              isCore={isCore}
              canEditTSF={canEditTSF}
              isEditMode={isUserActionEdit}
            />
          </Step>
          <Step key="associated-dams" disabled={!hasCreatedTSF}>
            <AssociatedDams isCore={isCore} canEditTSF={canEditTSF} isEditMode={isUserActionEdit} />
          </Step>
          <Step key="reports" disabled={!hasCreatedTSF}>
            <div />
          </Step>
          <Step key="summary" disabled={!hasCreatedTSF}>
            <div />
          </Step>
        </SteppedForm>
      </div>
    )) || <Loading />
  );
};

const mapStateToProps = (state, ownProps) => {
  const tsf = getTsf(state);

  return {
    isDirty: isDirty(ownProps.form)(state),
    mines: getMines(state),
    initialValues: {
      ...tsf,
      engineers_of_record: getEngineersOfRecord(state),
      qualified_persons: getQualifiedPersons(state),
    },
    eors: getEngineersOfRecordOptions(state),
    form: ownProps.form,
    userRoles: getUserAccessData(state),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPartyRelationships,
      updateTailingsStorageFacility,
      createTailingsStorageFacility,
      fetchTailingsStorageFacility,
      fetchMineRecordById,
      addPartyRelationship,
      addDocumentToRelationship,
      storeTsf,
      clearTsf,
      fetchPermits,
    },
    dispatch
  );

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withRouter(FeatureFlagGuard(Feature.TSF_V2)(TailingsSummaryPage)) as any
) as FC<TailingsSummaryPageProps>;
