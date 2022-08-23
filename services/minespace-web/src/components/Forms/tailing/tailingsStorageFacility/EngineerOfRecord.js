import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Popconfirm, Row, Typography } from "antd";
import { Field, change } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { requiredList, required, validateSelectOptions } from "@common/utils/Validate";
import { PlusOutlined } from "@ant-design/icons";
import * as PropTypes from "prop-types";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import { uniqBy } from "lodash";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  parties: PropTypes.arrayOf(PropTypes.object).isRequired,
  change: PropTypes.func.isRequired,
};

export const EngineerOfRecord = (props) => {
  const { parties } = props;
  const [partyOptions, setPartyOptions] = useState([]);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (parties) {
      const eors = parties.reduce((acc, party) => {
        if (party.mine_party_appt_type_code === "EOR") {
          acc.push({
            label: party.party.name,
            value: party.party.party_guid,
          });
        }
        return acc;
      }, []);
      setPartyOptions(uniqBy(eors, "value"));
    }
  }, [parties]);

  const handleSelectChange = (value) => {
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.party_guid", value);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.start_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.end_date", null);
  };

  return (
    <div>
      <Row justify="space-between">
        <Typography.Title level={3}>Engineer of Record</Typography.Title>
        <Popconfirm
          okText="Yes"
          cancelText="No"
          title="Are you sure you want to continue assigning a new EOR?"
          onConfirm={() => setIsEditable(!isEditable)}
        >
          <Button style={{ display: "inline", float: "right" }} type="primary">
            <PlusOutlined />
            Assign a new EOR
          </Button>
        </Popconfirm>
      </Row>
      <Alert
        description="Assigning a new Engineer of Record will replace the current EOR and set the previous EOR’s status to inactive."
        showIcon
        type="info"
      />
      <Typography.Title level={4} className="margin-large--top">
        Contact Information
      </Typography.Title>
      <Field
        id="engineer_of_record.party_guid"
        name="engineer_of_record.party_guid"
        label="Engineer of Record"
        placeholder="Select an Engineer of Record"
        disabled={!isEditable}
        component={renderConfig.SELECT}
        onChange={handleSelectChange}
        data={partyOptions}
        validate={[requiredList, validateSelectOptions(partyOptions)]}
      />
      <Typography.Title level={4} className="margin-large--top">
        EOR Term
      </Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Field
            id="engineer_of_record.start_date"
            name="engineer_of_record.start_date"
            label="Start Date"
            disabled={!isEditable}
            component={renderConfig.DATE}
            validate={[required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="engineer_of_record.end_date"
            name="engineer_of_record.end_date"
            label="End Date"
            disabled={!isEditable}
            component={renderConfig.DATE}
          />
        </Col>
      </Row>
    </div>
  );
};
EngineerOfRecord.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

const mapStateToProps = (state) => ({
  parties: getPartyRelationships(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
