import React, { FC, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Typography, Button } from "antd";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchMineRecordById,
  updateTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { useHistory } from "react-router-dom";
import { resetForm } from "@common/utils/helpers";
import { storeTsf, clearTsf } from "@mds/common/redux/actions/tailingsActions";
import { modalConfig } from "@/components/modalContent/config";
import { EDIT_TAILINGS_STORAGE_FACILITY, ADD_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import * as FORM from "@/constants/forms";
import TailingsTable from "./TailingsTable";
import { Feature, IMine, USER_ROLES } from "@mds/common";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";

const { Paragraph, Title, Text } = Typography;

export const Tailings: FC = () => {
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { isFeatureEnabled } = useFeatureFlag();
  const tsfV2Enabled = isFeatureEnabled(Feature.TSF_V2);
  const userRoles = useSelector(getUserAccessData);
  const canEditTSF = userRoles?.some(
    (r) => r === USER_ROLES.role_minespace_proponent || r === USER_ROLES.role_edit_tsf
  );

  const handleEditTailings = (values) => {
    return dispatch(
      updateTailingsStorageFacility(
        values.mine_guid,
        values.mine_tailings_storage_facility_guid,
        values
      )
    )
      .then(() => dispatch(closeModal()))
      .then(() => dispatch(fetchMineRecordById(values.mine_guid)));
  };

  const navigateToEditTailings = async (event, mineTSF, isEditMode) => {
    event.preventDefault();

    await dispatch(storeTsf(mineTSF));
    const url = EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
      mineTSF.mine_tailings_storage_facility_guid,
      mine.mine_guid,
      "basic-information",
      isEditMode
    );
    history.push(url);
  };

  const navigateToCreateTailings = async (event) => {
    event.preventDefault();
    resetForm(FORM.ADD_TAILINGS_STORAGE_FACILITY);
    await dispatch(clearTsf());
    const url = ADD_TAILINGS_STORAGE_FACILITY.dynamicRoute(mine.mine_guid);
    history.push(url);
  };

  const openEditTailingsModal = (event, onSubmit, record) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          initialValues: record,
          onSubmit,
          title: `Edit ${record.mine_tailings_storage_facility_name}`,
        },
        content: modalConfig.ADD_TAILINGS,
      })
    );
  };

  return (
    <Row>
      <Col span={24}>
        <Row justify={tsfV2Enabled ? "space-between" : "start"}>
          <Col>
            <Title level={4}>Tailings Storage Facilities</Title>
            <Paragraph>
              This table shows&nbsp;
              <Text className="color-primary" strong>
                Tailings Storage Facilities
              </Text>
              &nbsp;for your mine.
            </Paragraph>
            <br />
          </Col>
          {tsfV2Enabled && canEditTSF && (
            <Col>
              <Button type="primary" onClick={navigateToCreateTailings}>
                <PlusCircleFilled />
                Create New Facility
              </Button>
            </Col>
          )}
        </Row>
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <TailingsTable
              editTailings={navigateToEditTailings}
              tailings={mine.mine_tailings_storage_facilities}
              openEditTailingsModal={openEditTailingsModal}
              handleEditTailings={handleEditTailings}
              canEditTSF={canEditTSF}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Tailings;
