import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, DatePicker, Select } from "antd";
import { useSelector, connect } from "react-redux";
import { Field, getFormValues, change } from "redux-form";
import "@ant-design/compatible/assets/index.css";
import moment from "moment-timezone";
import { compose, bindActionCreators } from "redux";
import {
  DATETIME_TZ_FORMAT,
  DEFAULT_TIMEZONE,
  BC_TIMEZONE_NAMES,
  CANADA_TIMEZONE_MAP,
} from "@common/constants/strings";

const propTypes = {
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  timezoneFieldProps: PropTypes.shape({ name: PropTypes.string }).isRequired,
  disabled: PropTypes.bool,
  formName: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  displayFormat: PropTypes.string,
  timezone: PropTypes.string, // to set a default other than user TZ for new records
  showTimezones: PropTypes.arrayOf(PropTypes.string), // list of zones to show, user tz will be added if within Canada
  validate: PropTypes.arrayOf(PropTypes.func),
};
const defaultProps = {
  disabled: false,
  displayFormat: DATETIME_TZ_FORMAT,
  showTimezones: BC_TIMEZONE_NAMES,
  timezone: null,
  validate: [],
};

const RenderDateTimeTz = (props) => {
  const {
    disabled,
    timezoneFieldProps,
    formName,
    input,
    meta,
    displayFormat,
    validate,
    timezone,
    showTimezones,
  } = props;
  const formValues = useSelector((state) => getFormValues(formName)(state));
  const tzGuess = moment.tz.guess();
  // find the matching zone within Canada
  const userCanadaTz = Object.entries(CANADA_TIMEZONE_MAP).find(
    (zone) => zone[1].includes(tzGuess) || zone[0] === tzGuess
  );
  // return the tz name OR use the default if not within Canada.
  const userTz = userCanadaTz ? userCanadaTz[0] : DEFAULT_TIMEZONE;

  const defaultTimezone = formValues[timezoneFieldProps.name] ?? timezone ?? userTz;
  const [selectedTimezone, setTimezone] = useState(defaultTimezone);
  moment.tz.setDefault(defaultTimezone);

  const [selectedDatetime, setDatetime] = useState(input.value);
  // add user tz to select list if not included so they can translate
  const timezones = showTimezones.includes(userTz) ? showTimezones : [userTz, ...showTimezones];
  const timezoneOptions = timezones.map((item) => {
    return { label: item, value: item };
  });

  const datePickerFormat = (value) => {
    return value ? moment.tz(value, selectedTimezone).format(displayFormat) : "";
  };

  const updateFormValues = (datetime = selectedDatetime) => {
    props.change(formName, timezoneFieldProps.name, selectedTimezone);
    return input.onChange(datetime);
  };

  return (
    <Form.Item
      validateStatus={meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
    >
      <DatePicker
        id={input.name}
        meta={input.meta}
        showNow
        disabled={disabled}
        showTime={{ format: "HH:mm" }}
        format={datePickerFormat}
        value={selectedDatetime ? moment.tz(selectedDatetime, selectedTimezone) : null}
        validate={validate}
        onOpenChange={(open) => {
          if (!open) {
            updateFormValues();
          }
        }}
        onSelect={(val) => {
          setDatetime(val);
        }}
        renderExtraFooter={() => (
          <Form.Item label="Timezone" gutter={8} className="padding-md--top">
            <Field
              id={timezoneFieldProps.name}
              name={timezoneFieldProps.name}
              component={(tzProps) => (
                <Select
                  virtual={false}
                  disabled={disabled}
                  defaultValue={defaultTimezone}
                  dropdownMatchSelectWidth
                  getPopupContainer={(trigger) => trigger.parentNode}
                  dropdownStyle={{
                    zIndex: 100000,
                    position: "relative",
                  }}
                  value={selectedTimezone}
                  {...tzProps}
                  {...timezoneFieldProps}
                  onChange={(val) => {
                    setTimezone(val);
                  }}
                  options={timezoneOptions}
                />
              )}
            />
          </Form.Item>
        )}
      />
    </Form.Item>
  );
};

RenderDateTimeTz.propTypes = propTypes;
RenderDateTimeTz.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );
export default compose(connect(null, mapDispatchToProps))(RenderDateTimeTz);
