import React, { FC, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { Menu, Dropdown } from "antd";
import { withRouter, RouteComponentProps } from "react-router-dom";
import {
  getEditingConditionFlag,
  getDraftPermitAmendmentForNOW,
} from "@mds/common/redux/selectors/permitSelectors";
import {
  setEditingConditionFlag,
  createPermitCondition,
  fetchPermitConditions,
  fetchDraftPermitByNOW,
  createStandardPermitCondition,
  fetchStandardPermitConditions,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import AddButton from "@/components/common/buttons/AddButton";
import Condition from "@/components/Forms/permits/conditions/Condition";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { ActionCreator } from "@mds/common/interfaces/actionCreator"
import { IDraftPermitAmendment } from "@mds/common";

interface AddCondtionProps {
  initialValues: any;
  editingConditionFlag?: boolean;
  setEditingConditionFlag?: ActionCreator<typeof setEditingConditionFlag>;
  createPermitCondition?: ActionCreator<typeof createPermitCondition>;
  fetchPermitConditions?: ActionCreator<typeof fetchPermitConditions>;
  fetchDraftPermitByNOW?: ActionCreator<typeof fetchDraftPermitByNOW>;
  fetchStandardPermitConditions?: ActionCreator<typeof fetchStandardPermitConditions>;
  createStandardPermitCondition?: ActionCreator<typeof createStandardPermitCondition>;
  draftPermitAmendment?: IDraftPermitAmendment;
  match?: any;
  location?: any;
  layer: number;
}

const typeFromURL = {
  "sand-and-gravel": "SAG",
  quarry: "QCA",
  exploration: "MIN",
  placer: "PLA",
};

export const AddCondition: FC<RouteComponentProps & AddCondtionProps> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [conditionType, setConditionType] = useState("SEC");

  const handleSubmit = (values) => {
    const isDraftPermit = !isEmpty(props.draftPermitAmendment);
    const permitAmendmentGuid = isDraftPermit
      ? props.draftPermitAmendment.permit_amendment_guid
      : props.match.params.id;
    const isAdminDashboard = props.location.pathname.includes("admin/permit-condition-management");

    const payload = { ...values, condition_type_code: conditionType };
    if (isAdminDashboard) {
      return props
        .createStandardPermitCondition(typeFromURL[props.match.params.type], payload)
        .then(() => {
          setIsEditing(false);
          props.fetchStandardPermitConditions(typeFromURL[props.match.params.type]);
          props.setEditingConditionFlag(false);
        });
    }
    return props.createPermitCondition(permitAmendmentGuid, payload).then(() => {
      setIsEditing(false);
      props.fetchPermitConditions(permitAmendmentGuid);
      if (isDraftPermit) {
        props.fetchDraftPermitByNOW(null, props.draftPermitAmendment.now_application_guid);
      }
      props.setEditingConditionFlag(false);
    });
  };

  const handleCancel = (value) => {
    props.setEditingConditionFlag(value);
    setIsEditing(false);
  };

  const conditionMenu = () =>
    ({
      SEC: (
        <Menu>
          {(!props.initialValues.sibling_condition_type_code ||
            props.initialValues.sibling_condition_type_code === "SEC") && (
            <Menu.Item>
              <button
                type="button"
                className="full"
                onClick={() => {
                  props.setEditingConditionFlag(true);
                  setIsEditing(true);
                  setConditionType("SEC");
                }}
              >
                Sub-Section
              </button>
            </Menu.Item>
          )}
          {(!props.initialValues.sibling_condition_type_code ||
            props.initialValues.sibling_condition_type_code === "CON") && (
            <Menu.Item>
              <button
                type="button"
                className="full"
                onClick={() => {
                  props.setEditingConditionFlag(true);
                  setIsEditing(true);
                  setConditionType("CON");
                }}
              >
                Condition
              </button>
            </Menu.Item>
          )}
        </Menu>
      ),
      CON: (
        <Menu>
          <Menu.Item>
            <button
              type="button"
              className="full"
              onClick={() => {
                props.setEditingConditionFlag(true);
                setIsEditing(true);
                setConditionType("LIS");
              }}
            >
              List Item
            </button>
          </Menu.Item>
        </Menu>
      ),
      LIS: (
        <Menu>
          <Menu.Item>
            <button
              type="button"
              className="full"
              onClick={() => {
                props.setEditingConditionFlag(true);
                setIsEditing(true);
                setConditionType("LIS");
              }}
            >
              List Item
            </button>
          </Menu.Item>
        </Menu>
      ),
    }[props.initialValues.parent_condition_type_code]);

  const hasSibling = props.initialValues.sibling_condition_type_code;
  const addTitle = hasSibling ? "Add Another" : "Create";
  return (
    <>
      {!isEditing && props.editingConditionFlag && (
        <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
          {/* @ts-ignore */}
          <Dropdown
            className="full-height"
            overlay={conditionMenu()}
            placement="bottomLeft"
            disabled
          >
            {/* @ts-ignore */}
            <AddButton type="secondary" disabled>
              {addTitle}
            </AddButton>
          </Dropdown>
        </NOWActionWrapper>
      )}
      {!props.editingConditionFlag && (
        <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
          {/* @ts-ignore */}
          <Dropdown className="full-height" overlay={conditionMenu()} placement="bottomLeft">
            {/* @ts-ignore */}
            <AddButton type="secondary">{addTitle}</AddButton>
          </Dropdown>
        </NOWActionWrapper>
      )}
      {isEditing && (
        <Condition
          new
          handleCancel={() => handleCancel(false)}
          handleSubmit={(values) => handleSubmit(values)}
          initialValues={{
            ...props.initialValues,
            condition_type_code: conditionType,
          }}
        />
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  editingConditionFlag: getEditingConditionFlag(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setEditingConditionFlag,
      fetchPermitConditions,
      createPermitCondition,
      fetchDraftPermitByNOW,
      createStandardPermitCondition,
      fetchStandardPermitConditions,
    },
    dispatch
  );

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddCondition) as FC<
    AddCondtionProps & RouteComponentProps
  >
);
