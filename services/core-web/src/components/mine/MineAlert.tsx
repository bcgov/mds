import React, { Component } from "react";
import { Action, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { getFormValues, getFormSyncErrors } from "redux-form";
import { Alert, Button, Col, Row, Menu, Dropdown, Popconfirm } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import { formatDate } from "@common/utils/helpers";
import { DownOutlined } from "@ant-design/icons";
import moment from "moment";
import { getMineAlerts } from "@/selectors/mineAlertSelectors";
import {
  createMineAlert,
  updateMineAlert,
  fetchMineAlertsByMine,
  deleteMineAlert,
} from "@/actionCreators/mineAlertActionCreator";
import * as FORM from "@/constants/forms";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { IMineAlert } from "@mds/common";

interface MineAlertProps {
  closeModal: () => void;
  openModal: (arg: unknown) => void;
  createMineAlert: (arg1: string, arg2: IMineAlert) => Promise<IMineAlert>;
  updateMineAlert: (arg1: string, arg2: string, arg3: IMineAlert) => Promise<IMineAlert>;
  deleteMineAlert: (arg1: string, arg2: string) => Promise<void>;
  fetchMineAlertsByMine: (arg: string) => Promise<IMineAlert>;
  mineAlerts: any;
  mine: any;
}

interface MineAlertState {
  loaded: boolean;
  activeMineAlert: any;
  pastMineAlerts: any[];
}

export class MineAlert extends Component<MineAlertProps, MineAlertState> {
  constructor(props: MineAlertProps) {
    super(props);
    this.state = {
      loaded: false,
      activeMineAlert: {},
      pastMineAlerts: [],
    };
  }

  componentDidMount() {
    this.fetchAlerts();
  }

  handleCreateMineAlert = (values: IMineAlert) => {
    this.props
      .createMineAlert(this.props.mine.mine_guid, values)
      .then(() => {
        this.fetchAlerts();
      })
      .finally(() => {
        this.props.closeModal();
      });
  };

  handleUpdateMineAlert = (values: IMineAlert) => {
    this.props
      .updateMineAlert(this.props.mine.mine_guid, values.mine_alert_guid, values)
      .then(() => {
        this.fetchAlerts();
        this.props.closeModal();
      });
  };

  handleRemoveAlert = (mineAlertGuid: string) => {
    this.props
      .deleteMineAlert(this.props.mine.mine_guid, mineAlertGuid)
      .then(() => this.fetchAlerts());
  };

  submitCreateMineAlarmForm = () => (values: IMineAlert) => {
    const payload = {
      ...values,
      start_date: moment(values.start_date),
      end_date: values.end_date ? moment(values.end_date) : null,
    };
    return this.handleCreateMineAlert(payload);
  };

  submitUpdateMineAlarmForm = (mineAlertGuid: string) => (values: IMineAlert) => {
    const payload = {
      ...values,
      start_date: moment(values.start_date),
      end_date: values.end_date ? moment(values.end_date) : null,
    };
    if (mineAlertGuid) {
      return this.handleUpdateMineAlert(payload);
    }
    return null;
  };

  openCreateMineAlertModal = (activeMineAlert: any, mineAlerts: any) => {
    return this.props.openModal({
      props: {
        title: ModalContent.CREATE_MINE_ALERT_RECORD,
        text: ModalContent.CREATE_MINE_ALERT_TEXT,
        mineAlertGuid: this.state.activeMineAlert?.mine_alert_guid,
        closeModal: this.props.closeModal,
        onSubmit: this.submitCreateMineAlarmForm(),
        activeMineAlert,
        mineAlerts,
      },
      content: modalConfig.ADD_MINE_ALERT,
    });
  };

  openUpdateMineAlertModal = (activeMineAlert: any, mineAlerts: any) => {
    return this.props.openModal({
      props: {
        title: ModalContent.EDIT_MINE_ALERT_RECORD,
        text: ModalContent.EDIT_MINE_ALERT_TEXT,
        initialValues: this.state.activeMineAlert,
        mineAlertGuid: this.state.activeMineAlert?.mine_alert_guid,
        closeModal: this.props.closeModal,
        onSubmit: this.submitUpdateMineAlarmForm(this.state.activeMineAlert?.mine_alert_guid),
        activeMineAlert,
        mineAlerts,
      },
      content: modalConfig.ADD_MINE_ALERT,
    });
  };

  openviewPastMineAlertModal = () => {
    return this.props.openModal({
      props: {
        title: ModalContent.PAST_MINE_ALERT_RECORD,
        mineAlerts: this.state.pastMineAlerts,
        closeModal: this.props.closeModal,
      },
      content: modalConfig.VIEW_PAST_MINE_ALERTS,
    });
  };

  async fetchAlerts(): Promise<void> {
    await this.props.fetchMineAlertsByMine(this.props.mine.mine_guid);
    this.setState({
      activeMineAlert: this.props.mineAlerts?.filter(
        (alert: { is_active: boolean }) => alert.is_active
      )?.[0],
    });
    this.setState({
      pastMineAlerts: this.props.mineAlerts?.filter(
        (alert: { is_active: boolean }) => !alert.is_active
      ),
    });
    this.setState({ loaded: true });
  }

  render() {
    const menu: any = (
      <Menu>
        <Menu.Item key="create">
          <button
            type="button"
            className="full add-permit-dropdown-button"
            onClick={() =>
              this.openCreateMineAlertModal(this.state.activeMineAlert, this.state.pastMineAlerts)
            }
          >
            Create New Alert
          </button>
        </Menu.Item>
        {this.state.activeMineAlert && (
          <Menu.Item key="edit">
            <button
              type="button"
              className="full add-permit-dropdown-button"
              onClick={() =>
                this.openUpdateMineAlertModal(this.state.activeMineAlert, this.state.pastMineAlerts)
              }
            >
              Edit Active Alert
            </button>
          </Menu.Item>
        )}
        {this.state.activeMineAlert && (
          <Menu.Item key="remove">
            <Popconfirm
              title={`Are you sure you want to delete alarm? ${formatDate(
                this.state.activeMineAlert?.start_date
              )} ${
                this.state.activeMineAlert.end_date
                  ? `-  ${formatDate(this.state.activeMineAlert?.end_date)}`
                  : ""
              }`}
              onConfirm={() => this.handleRemoveAlert(this.state.activeMineAlert?.mine_alert_guid)}
              okText="Delete"
              cancelText="Cancel"
            >
              <button
                type="button"
                className="full add-permit-dropdown-button"
                disabled={!this.state.activeMineAlert}
              >
                Remove Alert
              </button>
            </Popconfirm>
          </Menu.Item>
        )}
        <Menu.Item key="history">
          <button
            type="button"
            className="full add-permit-dropdown-button"
            onClick={() => this.openviewPastMineAlertModal()}
          >
            View Alert History
          </button>
        </Menu.Item>
      </Menu>
    );

    return (
      <div>
        {this.state.loaded && !this.state.activeMineAlert && (
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
                    {/* @ts-ignore */}
                    <Dropdown overlay={menu} placement="bottomLeft">
                      {/* @ts-ignore */}
                      <Button type="secondary" className="ant-btn-alert-info-ghost">
                        Actions
                        <DownOutlined className="padding-sm--left" />
                      </Button>
                    </Dropdown>
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
        {this.state.loaded && this.state.activeMineAlert && (
          <Alert
            message=""
            description={
              <Row>
                <Col xs={24} md={18}>
                  <p>
                    {this.state.activeMineAlert.end_date ? (
                      <b>
                        {`Active Alert: ${formatDate(
                          this.state.activeMineAlert.start_date
                        )} - ${formatDate(this.state.activeMineAlert.end_date)}`}
                      </b>
                    ) : (
                      <b>{`Active Alert: ${formatDate(this.state.activeMineAlert.start_date)}`}</b>
                    )}
                  </p>
                  <p>
                    {this.state.activeMineAlert.message}
                    <br />
                    For more information contact: {this.state.activeMineAlert.contact_name} -{" "}
                    {this.state.activeMineAlert.contact_phone}
                  </p>
                </Col>
                <Col xs={24} md={6}>
                  <div className="right center-mobile">
                    {/* @ts-ignore */}
                    <Dropdown
                      className="full-height full-mobile"
                      overlay={menu}
                      placement="bottomLeft"
                    >
                      {/* @ts-ignore */}
                      <Button type="secondary" className="ant-btn-alert-warning-ghost">
                        Actions
                        <DownOutlined className="padding-sm--left" />
                      </Button>
                    </Dropdown>
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
  }
}
const mapStateToProps = (state: any) => ({
  mineAlerts: getMineAlerts(state),
  formValues: getFormValues(FORM.ADD_EDIT_MINE_ALERT)(state),
  formErrors: getFormSyncErrors(FORM.ADD_EDIT_MINE_ALERT)(state),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchMineAlertsByMine,
      updateMineAlert,
      deleteMineAlert,
      createMineAlert,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineAlert);
