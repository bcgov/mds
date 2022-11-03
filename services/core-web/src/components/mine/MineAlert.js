import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getFormValues, getFormSyncErrors } from "redux-form";
import { Alert, Button, Col, Row, Menu, Dropdown } from "antd";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import { COLOR } from "@/constants/styles";
import { getMineAlerts } from "@common/selectors/mineSelectors";
import * as FORM from "@/constants/forms";
import moment from "moment";

const propTypes = {
    closeModal: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    mine: CustomPropTypes.mine.isRequired,
}

export class MineAlert extends Component {
    // state = { loading: true };

    componentDidMount() {
        this.fetchAlerts();
    }

    handleCreateMineAlert = (mineGuid, values) => {
        this.props.createMineAlert(mineGuid, values).then(() => {
            this.props.fetchAlerts();
            this.props.closeModal();
        });
    };

    handleUpdateMineAlert = (values) => {
        this.props
            .updateMineAlert(this.props.mine.mine_guid, values.mine_alert_guid, values).then(() => {
                this.props.fetchAlerts();
                this.props.closeModal();
            });
    };

    handleRemoveAlert = (mineAlertGuid) => {
        this.props.deleteMineAlert(this.props.mine.mine_guid, mineAlertGuid).then(() => this.props.fetchAlerts());
    };

    fetchAlerts() {
        // this.setState({ loading: true });
        return this.props.fetchMineAlertByMine(this.props.mine.mine_guid);
    }

    submitMineAlarmForm = (mineAlertGuid) => (values) => {
        const payload = {
            ...values,
            start_date: moment(values.start_date),
            end_date: values.end_date ? moment(values.end_date) : null,
        }
        const action = mineAlertGuid
            ? this.handleUpdateMineAlert(this.props.mine.mine_guid, mineAlertGuid, payload)
            : this.handleCreateMineAlert(this.props.mine.mine_guid, payload);

        return action.then(() => {
            return this.props.fetchAlerts().then(() => this.props.closeModal())
        });
    };

    openMineAlertModal = (mineAlerts = null) => {
        return this.props.openModal({
            props: {
                title: mineAlerts ? ModalContent.EDIT_MINE_ALERT_RECORD : ModalContent.CREATE_MINE_ALERT_RECORD,
                initialValues: mineAlerts ?? [],
                mineAlertGuid: mineAlerts?.mineAlertGuid,
                closeModal: this.props.closeModal,
                onSubmit: this.submitMineAlarmForm(mineAlerts?.mineAlertGuid),
            },
            content: modalConfig.ADD_MINE_ALERT,
        });
    }

    render() {
        const menu = (
            <Menu>
                <Menu.Item key="create">
                    <button
                        type="button"
                        className="full add-permit-dropdown-button"
                        onClick={() => this.openMineAlertModal()}
                    >
                        Create New Alert
                    </button>
                </Menu.Item>
                <Menu.Item key="edit">
                    <button
                        type="button"
                        className="full add-permit-dropdown-button"
                        onClick={() => this.openMineAlertModal(this.props.mineAlerts)}
                    >
                        Edit Active Alert
                    </button>
                </Menu.Item>
                <Menu.Item key="remove">
                    <button
                        type="button"
                        className="full add-permit-dropdown-button"
                        onClick={() => this.openMineAlertModal(this.props.mineAlerts)}
                    >
                        Remove Alert
                    </button>
                </Menu.Item>
                <Menu.Item key="remove">
                    <button
                        type="button"
                        className="full add-permit-dropdown-button"
                        onClick={() => this.openMineAlertModal()}
                    >
                        View Alert History
                    </button>
                </Menu.Item>

            </Menu>
        )

        return (
            <div>
                <Alert
                    description={
                        <Row>
                            <Col xs={24} md={18}>
                                <p>
                                    <b>There are no active staff alerts for this mine.</b>
                                </p>
                            </Col>
                            <Col xs={24} md={6}>
                                <div className="right center-mobile">
                                    <Dropdown
                                        className="full-height full-mobile"
                                        overlay={menu}
                                        placement="bottomLeft"
                                    >
                                        <Button type="secondary" className="alert-button">
                                            Actions
                                        </Button>
                                    </Dropdown>
                                </div>
                            </Col>
                        </Row>
                    }
                    type="info"
                    showIcon
                    style={{
                        backgroundColor: COLOR.lightGrey,
                    }}
                />
            </div>
        )

    }
}

const mapStateToProps = (state) => ({
    mineAlerts: getMineAlerts(state),
    formValues: getFormValues(FORM.ADD_EDIT_MINE_ALERT)(state),
    formErrors: getFormSyncErrors(FORM.ADD_EDIT_MINE_ALERT)(state),
});

MineAlert.propTypes = propTypes;

export default connect(mapStateToProps)(MineAlert);