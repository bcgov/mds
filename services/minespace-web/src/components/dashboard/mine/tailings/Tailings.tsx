import React, { FC, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Typography, Button } from "antd";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchTsfsByMineGuid,
  getTsfsByMineGuid,
  updateTailingsStorageFacility,
} from "@mds/common/redux/slices/tailingsSlice";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { useHistory } from "react-router-dom";
import { resetForm } from "@common/utils/helpers";
import { modalConfig } from "@/components/modalContent/config";
import { EDIT_TAILINGS_STORAGE_FACILITY, ADD_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import { FORM } from "@mds/common/constants/forms";
import TailingsTable from "./TailingsTable";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { IMine } from "@mds/common/interfaces/mine.interface";
import { Feature } from "@mds/common/utils/featureFlag";
import { USER_ROLES } from "@mds/common/constants/environment";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchPartyRelationships } from "@mds/common/redux/slices/partiesSlice";

const { Paragraph, Title, Text } = Typography;

export const Tailings: FC = () => {
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { isFeatureEnabled } = useFeatureFlag();
  const tsfV2Enabled = isFeatureEnabled(Feature.TSF_V2);
  const userRoles = useSelector(getUserAccessData);
  const canEditTSF = userRoles?.some(
    (r) => r === USER_ROLES.role_minespace_proponent || r === USER_ROLES.role_edit_tsf
  );

  const tailings = useAppSelector(getTsfsByMineGuid(mine.mine_guid));
  const [isLoaded, setIsLoaded] = useState(Boolean(tailings));

  useEffect(() => {
    if (!isLoaded) {
      Promise.all([
        dispatch(fetchTsfsByMineGuid(mine.mine_guid)),
        dispatch(fetchPartyRelationships({ mine_guid: mine.mine_guid })),
      ]).then(() => setIsLoaded(true));
    }
  }, []);

  const handleEditTailings = (values) => {
    return dispatch(updateTailingsStorageFacility(values)).then(() => dispatch(closeModal()));
  };

  const navigateToEditTailings = async (event, mineTSF, isEditMode) => {
    event.preventDefault();

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
            <Title level={1}>Tailings Storage Facilities</Title>
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
              <Button
                type="primary"
                onClick={navigateToCreateTailings}
                className="dashboard-add-button"
              >
                <PlusCircleFilled />
                Create New Facility
              </Button>
            </Col>
          )}
        </Row>
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <TailingsTable
              isLoaded={isLoaded}
              editTailings={navigateToEditTailings}
              tailings={tailings}
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
