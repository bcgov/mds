import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Form, Col, Row, Collapse } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
} from "@common/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";

const { Panel } = Collapse;

const propTypes = {
    isViewMode: PropTypes.bool.isRequired,
};

const defaultProps = {
};

export class Conditions extends Component {
    state = {
    };

    componentWillMount = () => {
    };

    render() {
        return (
            <>
                <Collapse defaultActiveKey={["general"]}>
                    <Panel header="A. General Conditions" key="general" id="general">
                        <Row gutter={32}>
                            <Col xs={24} md={12}>
                                <Field
                                    id="conditions"
                                    name="conditions"
                                    label="Conditions"
                                    required
                                    component={renderConfig.AUTO_SIZE_FIELD}
                                    validate={[required]}
                                    disabled={props.isViewMode}
                                />
                            </Col>
                        </Row>
                    </Panel>
                    <Panel header="B. Healthy and Safety Conditions" key="health-safety" id="health-safety">
                        <p>No conditions</p>
                    </Panel>
                    <Panel header="C. Geotechnical Conditions" key="geotechnical" id="geotechnical">
                        <p>No conditions</p>
                    </Panel>
                    <Panel
                        header="D. Environmental Land and Watercourses Conditions"
                        key="environmental-land"
                        id="environmental-land"
                    >
                        <p>No conditions</p>
                    </Panel>
                    <Panel
                        header="E. Reclamation and Closure Program Conditions"
                        key="reclamation-closure"
                        id="reclamation-closure"
                    >
                        <p>No conditions</p>
                    </Panel>
                    <Panel
                        header="F. Additional Conditions"
                        key="additional-conditions"
                        id="additional-conditions"
                    >
                        <p>No conditions</p>
                    </Panel>
                </Collapse>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            openModal,
            closeModal,
        },
        dispatch
    );

Conditions.propTypes = propTypes;
Conditions.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
