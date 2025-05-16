import React, { FC, useEffect, useState } from "react";
import { Alert, Col, Row, Modal } from "antd";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { formatDate } from "@mds/common/redux/utils/helpers";
import moment from "moment";
import { getMineAlerts } from "@/selectors/mineAlertSelectors";
import {
  createMineAlert,
  updateMineAlert,
  fetchMineAlertsByMine,
  deleteMineAlert,
} from "@/actionCreators/mineAlertActionCreator";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { IMine, IMineAlert } from "@mds/common/interfaces";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { ActionMenuButton, IHeaderAction } from "@mds/common/components/common/ActionMenu";


interface MineAlertProps {
  mine: IMine;
}

const MineAlert: FC<MineAlertProps> = ({ mine }) => {
  const dispatch = useAppDispatch();
  const [activeMineAlert, setActiveMineAlert] = useState<IMineAlert>();
  const [pastMineAlerts, setPastMineAlerts] = useState<IMineAlert[]>([]);
  const mineAlerts = useAppSelector(getMineAlerts);
  const [loaded, setLoaded] = useState(mineAlerts.some(alert => alert.mine_guid === mine.mine_guid));

  const fetchAlerts = async () => {
    setLoaded(false);
    await dispatch(fetchMineAlertsByMine(mine.mine_guid));
    setLoaded(true);
  };

  const remainingDays = (endDate: string) => {
    const today = moment().startOf("day");
    const end = moment(endDate).startOf("day");
    return end.diff(today, "days");
  };

  useEffect(() => {
    if (mineAlerts?.length > 0) {
      const newActive = mineAlerts.filter((alert) => {
        return alert.is_active && (alert.end_date == null || remainingDays(alert.end_date) >= 0)
      })?.[0];
      setActiveMineAlert(newActive);
      const pastAlerts = mineAlerts.filter((alert) => {
        return !alert.is_active || (alert.end_date && remainingDays(alert.end_date) < 0);
      });
      setPastMineAlerts(pastAlerts);
    }

  }, [mineAlerts])

  useEffect(() => {
    if (!loaded) {
      fetchAlerts();
    }
  }, []);

  const handleCreateMineAlert = (values: IMineAlert) => {
    dispatch(createMineAlert(mine.mine_guid, values))
      .then(() => {
        fetchAlerts();
      })
      .finally(() => {
        dispatch(closeModal());
      });
  };

  const handleUpdateMineAlert = (values: IMineAlert) => {
    dispatch(updateMineAlert(mine.mine_guid, values.mine_alert_guid, values))
      .then(() => {
        fetchAlerts();
        dispatch(closeModal());
      });
  };

  const handleRemoveAlert = (mineAlertGuid: string) => {
    dispatch(deleteMineAlert(mine.mine_guid, mineAlertGuid))
      .then(() => fetchAlerts());
  };

  const removeConfirmWrapper = (mineAlert: IMineAlert) => {
    const endDate = mineAlert.end_date ? ` - ${formatDate(activeMineAlert.end_date)}` : "";
    const title = `Are you sure you want to delete alarm? ${formatDate(
      mineAlert.start_date
    )}${endDate}`;
    return Modal.confirm({
      title,
      onOk: () => handleRemoveAlert(activeMineAlert.mine_alert_guid),
      okText: "Delete",
    })
  };

  const submitCreateMineAlarmForm = () => (values: IMineAlert) => {
    const payload = {
      ...values,
      start_date: moment(values.start_date).toISOString(),
      end_date: values.end_date ? moment(values.end_date).toISOString() : null,
    };
    return handleCreateMineAlert(payload);
  };

  const submitUpdateMineAlarmForm = (mineAlertGuid: string) => (values: IMineAlert) => {
    const payload = {
      ...values,
      start_date: moment(values.start_date).toISOString(),
      end_date: values.end_date ? moment(values.end_date).toISOString() : null,
    };
    if (mineAlertGuid) {
      return handleUpdateMineAlert(payload);
    }
    return null;
  };

  const openCreateMineAlertModal = (activeMineAlert: IMineAlert, mineAlerts: IMineAlert[]) => {
    dispatch(openModal({
      props: {
        title: ModalContent.CREATE_MINE_ALERT_RECORD,
        text: ModalContent.CREATE_MINE_ALERT_TEXT,
        mineAlertGuid: activeMineAlert?.mine_alert_guid,
        closeModal: () => dispatch(closeModal()),
        onSubmit: submitCreateMineAlarmForm(),
        activeMineAlert,
        mineAlerts,
      },
      content: modalConfig.ADD_MINE_ALERT,
    }));
  };

  const openUpdateMineAlertModal = (activeMineAlert: IMineAlert, mineAlerts: IMineAlert[]) => {
    return dispatch(openModal({
      props: {
        title: ModalContent.EDIT_MINE_ALERT_RECORD,
        text: ModalContent.EDIT_MINE_ALERT_TEXT,
        initialValues: activeMineAlert,
        mineAlertGuid: activeMineAlert?.mine_alert_guid,
        closeModal: () => dispatch(closeModal()),
        onSubmit: submitUpdateMineAlarmForm(activeMineAlert?.mine_alert_guid),
        activeMineAlert,
        mineAlerts,
      },
      content: modalConfig.ADD_MINE_ALERT,
    }));
  };

  const openviewPastMineAlertModal = () => {
    return dispatch(openModal({
      props: {
        title: ModalContent.PAST_MINE_ALERT_RECORD,
        mineAlerts: pastMineAlerts,
        closeModal: () => dispatch(closeModal()),
      },
      content: modalConfig.VIEW_PAST_MINE_ALERTS,
    }));
  };

  const menuActions: IHeaderAction[] = [
    {
      key: "create",
      label: "Create New Alert",
      clickFunction: () => openCreateMineAlertModal(activeMineAlert, pastMineAlerts)
    },
    activeMineAlert && {
      key: "edit",
      label: "Edit Active Alert",
      clickFunction: () => openUpdateMineAlertModal(activeMineAlert, pastMineAlerts)
    },
    activeMineAlert && {
      key: "remove",
      label: "Remove Alert",
      clickFunction: () => removeConfirmWrapper(activeMineAlert)
    },
    {
      key: "history",
      label: "View Alert History",
      clickFunction: () => openviewPastMineAlertModal()
    }
  ].filter(Boolean);

  const dropdownMenu = <ActionMenuButton
    actions={menuActions}
    buttonProps={{ style: { backgroundColor: "transparent" } }}
  />;

  return (
    <div>
      {loaded && !activeMineAlert && (
        <Alert
          message=""
          description={
            <Row>
              <Col xs={24} md={18}>
                <p>
                  <b>There are no active staff alerts for this mine.</b>
                </p>
              </Col>
              <Col xs={24} md={6}>
                <div className="right center-mobile">
                  {dropdownMenu}
                </div>
              </Col>
            </Row>
          }
          type="info"
          showIcon
          style={{ backgroundColor: "#F4F0F0", border: "1.5px solid #525252" }}
          className="ant-alert-info ant-alert-info-custom-with-black-icon"
        />
      )}
      {loaded && activeMineAlert && (
        <Alert
          message=""
          description={
            <Row>
              <Col xs={24} md={18}>
                <p>
                  {activeMineAlert.end_date ? (
                    <b>
                      {`Active Alert: ${formatDate(
                        activeMineAlert.start_date
                      )} - ${formatDate(activeMineAlert.end_date)}`}
                    </b>
                  ) : (
                    <b>{`Active Alert: ${formatDate(activeMineAlert.start_date)}`}</b>
                  )}
                </p>
                <p>
                  {activeMineAlert.message}
                  <br />
                  For more information contact: {activeMineAlert.contact_name} -{" "}
                  {activeMineAlert.contact_phone}
                </p>
              </Col>
              <Col xs={24} md={6}>
                <div className="right center-mobile">
                  {dropdownMenu}
                </div>
              </Col>
            </Row>
          }
          type="warning"
          showIcon
          style={{ backgroundColor: "#FFF2F0", border: "1.5px solid #FF0000" }}
          className="ant-alert-warning ant-alert-warning-custom-with-red-icon"
        />
      )}
    </div>
  );
};


export default MineAlert;
