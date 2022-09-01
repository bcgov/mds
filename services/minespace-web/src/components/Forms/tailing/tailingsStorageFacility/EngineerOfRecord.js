import React from "react";
import { Alert, Col, Row, Typography } from "antd";
import { change, Field } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { required, requiredList, validateSelectOptions } from "@common/utils/Validate";
import * as PropTypes from "prop-types";
import { getEngineersOfRecordOptions } from "@common/selectors/partiesSelectors";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  eors: PropTypes.arrayOf(PropTypes.object).isRequired,
  change: PropTypes.func.isRequired,
};

export const EngineerOfRecord = (props) => {
  const { eors } = props;

  const handleSelectChange = (value) => {
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.party_guid", value);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.start_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.end_date", null);
  };

  return (
    <div>
      <Typography.Title level={3}>Engineer of Record</Typography.Title>
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
        component={renderConfig.SELECT}
        onChange={handleSelectChange}
        data={eors}
        validate={[requiredList, validateSelectOptions(eors)]}
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
            component={renderConfig.DATE}
            validate={[required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="engineer_of_record.end_date"
            name="engineer_of_record.end_date"
            label="End Date"
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
  eors: getEngineersOfRecordOptions(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
