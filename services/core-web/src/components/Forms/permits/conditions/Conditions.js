import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Row, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
} from "@common/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import Condition from "@/components/Forms/permits/conditions/Condition";
import AddButton from "@/components/common/AddButton";

const { Panel } = Collapse;

const propTypes = {
    isViewMode: PropTypes.bool.isRequired,
    conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
};

const defaultProps = {
    conditions:
        [
            {
                step: '1.',
                condition: 'Mine Emergency Response Plan',
                condition_category: 'HSC',
                condition_type: 'SEC',
                conditions: [
                    {
                        step: '',
                        condition: 'The Mine Emergency Response Plan ("MERP") must be implemented prior to commencement. In addition to addressing daily operational issues, the plan shall specifically address emergency evacuation of personnel due to injury and forest fire hazard. All persons employed or visiting on the mine shall be trained with the MERP. The plan shall be available on site for review upon request and must be updated as changes arise.',
                        condition_category: 'HSC',
                        condition_type: 'CON',
                        conditions: [
                            {
                                step: 'a.',
                                condition: 'Something in a list.',
                                condition_category: 'HSC',
                                condition_type: 'LST',
                                conditions: []
                            },
                            {
                                step: 'b.',
                                condition: 'Something in a list.',
                                condition_category: 'HSC',
                                condition_type: 'LST',
                                conditions: []
                            }
                        ]
                    }
                ]
            }
        ]
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
                        <Condition condition={this.props.conditions[0]} />
                        <Divider />
                        <AddButton type="secondary">Add Sub-Section</AddButton>
                        <Button type="secondary" className="full-mobile btn--middle">
                            <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                            Restore Deleted Standard Conditions
                        </Button>
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
