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
  updateTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { flattenObject } from "@common/utils/helpers";
import {
  FormErrors,
  getFormSyncErrors,
  getFormValues,
  InjectedFormProps,
  isDirty,
  reduxForm,
  submit,
  touch,
} from "redux-form";

import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import BasicInformation from "@common/components/tailings/BasicInformation";
import Step from "@common/components/Step";
import SteppedForm from "@common/components/SteppedForm";
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

interface TailingsSummaryPageProps {
  form: string;
  mineGuid: string;
  tsfGuid: string;
  tab: string;
  mines?: IMine[];
  history?: { push: (path: string) => void; replace: (path: string) => void };
  submit?: (form: string) => void;
  formErrors?: FormErrors;
  location?: { pathname: string };
  fetchPartyRelationships?: ActionCreator<typeof fetchPartyRelationships>;
  addDocumentToRelationship?: ActionCreator<typeof addDocumentToRelationship>;
  updateTailingsStorageFacility?: ActionCreator<typeof updateTailingsStorageFacility>;
  createTailingsStorageFacility?: ActionCreator<typeof createTailingsStorageFacility>;
  addPartyRelationship?: ActionCreator<typeof addPartyRelationship>;
  formValues?: Partial<ITailingsStorageFacility>;
  fetchPermits?: ActionCreator<typeof fetchPermits>;
  fetchMineRecordById?: ActionCreator<typeof fetchMineRecordById>;
  storeTsf?: typeof storeTsf;
  clearTsf?: typeof clearTsf;
  isDirty?: (form: string) => boolean;
  initialValues?: Partial<ITailingsStorageFacility>;
  canEditTSF: boolean;
}

export const TailingsSummaryPage: FC<InjectedFormProps<ITailingsStorageFacility> &
  TailingsSummaryPageProps> = (props) => {
  const { mines, history, formErrors, formValues, mineGuid, tsfGuid, tab, canEditTSF } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { renderConfig, components, routes, isCore } = useContext(TailingsContext);

  const { Loading } = components;

  const handleFetchData = async (forceReload = false) => {
    setIsReloading(true);
    await props.fetchPermits(mineGuid);

    if (tsfGuid) {
      if (!props.initialValues.mine_tailings_storage_facility_guid || forceReload) {
        const mine = await props.fetchMineRecordById(mineGuid);
        const existingTsf = mine.data.mine_tailings_storage_facilities.find(
          (tsf) => tsf.mine_tailings_storage_facility_guid === tsfGuid
        );

        props.storeTsf(existingTsf);

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

  const handleSaveData = async (e, newActiveTab) => {
    if (e) {
      e.preventDefault();
    }

    props.submit(props.form);
    const errors = Object.keys(flattenObject(formErrors));

    if (errors?.length) {
      return;
    }

    let newTsf = null;

    switch (tab) {
      case "basic-information":
        if (tsfGuid) {
          if (props.isDirty) {
            await props.updateTailingsStorageFacility(mineGuid, tsfGuid, formValues);
          }
        } else {
          newTsf = await props.createTailingsStorageFacility(
            mineGuid,
            formValues as ICreateTailingsStorageFacility
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

        if (!formValues[attr].mine_party_appt_guid && formValues[attr].party_guid) {
          // Only add party relationship if changed
          const relationship = await props.addPartyRelationship(
            {
              mine_guid: mineGuid,
              party_guid: formValues[attr].party_guid,
              mine_party_appt_type_code: apptType,
              related_guid: tsfGuid,
              start_date: formValues[attr].start_date,
              end_date: formValues[attr].end_date,
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
        newActiveTab || "engineer-of-record"
      )
    );
  };

  const handleTabChange = async (newActiveTab) => {
    let url;

    if (tsfGuid) {
      url = routes.EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(tsfGuid, mineGuid, newActiveTab);
    } else {
      url = routes.ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(newActiveTab);
    }
    history.push(url);
  };

  const errors = Object.keys(flattenObject(formErrors));
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
          errors={errors}
          handleSaveData={handleSaveData}
          handleTabChange={handleTabChange}
          activeTab={tab}
        >
          <Step key="basic-information">
            <BasicInformation renderConfig={renderConfig} viewOnly={!props.canEditTSF} />
          </Step>
          <Step key="engineer-of-record" disabled={!hasCreatedTSF}>
            <EngineerOfRecord
              formType={props.form}
              loading={isReloading}
              mineGuid={mineGuid}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              canEditTSF={canEditTSF}
            />
          </Step>
          <Step key="qualified-person" disabled={!hasCreatedTSF}>
            <QualifiedPerson
              tsfFormName={props.form}
              loading={isReloading}
              mineGuid={mineGuid}
              isCore={isCore}
              canEditTSF={canEditTSF}
            />
          </Step>
          <Step key="associated-dams" disabled={!hasCreatedTSF}>
            <AssociatedDams isCore={isCore} canEditTSF={canEditTSF} />
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
    anyTouched: state.form[ownProps.form]?.anyTouched || false,
    isDirty: isDirty(ownProps.form)(state),
    fieldsTouched: state.form[ownProps.form]?.fields || {},
    mines: getMines(state),
    formErrors: getFormSyncErrors(ownProps.form)(state),
    formValues: getFormValues(ownProps.form)(state),
    initialValues: {
      ...tsf,
      engineers_of_record: getEngineersOfRecord(state),
      qualified_persons: getQualifiedPersons(state),
    },
    eors: getEngineersOfRecordOptions(state),
    form: ownProps.form,
  };
};

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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    touchOnBlur: true,
    touchOnChange: false,
    enableReinitialize: true,
    destroyOnUnmount: true,
    onSubmit: () => {},
  })
)(withRouter(FeatureFlagGuard(Feature.TSF_V2)(TailingsSummaryPage)) as any) as FC<
  TailingsSummaryPageProps
>;
