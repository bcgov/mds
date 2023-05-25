import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, DatePicker, Select } from "antd";
import { useSelector, connect } from "react-redux";
import { Field, getFormValues, change } from "redux-form";
import "@ant-design/compatible/assets/index.css";
import moment from "moment-timezone";
import { compose, bindActionCreators } from "redux";
import {
  DATETIME_TZ_INPUT_FORMAT,
  DATE_TZ_INPUT_FORMAT,
  DEFAULT_TIMEZONE,
  BC_TIMEZONE_NAMES,
  CANADA_TIMEZONE_MAP,
} from "@common/constants/strings";

const propTypes = {
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  timezoneFieldProps: PropTypes.shape({ name: PropTypes.string }),
  disabled: PropTypes.bool,
  change: PropTypes.func.isRequired,
  displayFormat: PropTypes.string,
  timezone: PropTypes.string, // to set a default other than user TZ for new records
  showTime: PropTypes.bool,
  showTimezones: PropTypes.arrayOf(PropTypes.string), // list of zones to show, user tz will be added if within Canada
  validate: PropTypes.arrayOf(PropTypes.func),
};
const defaultProps = {
  disabled: false,
  displayFormat: null,
  showTime: true,
  showTimezones: BC_TIMEZONE_NAMES,
  timezone: null,
  validate: [],
};

const RenderDateTimeTz = (props) => {
  const {
    disabled,
    timezoneFieldProps,
    input,
    meta,
    displayFormat,
    validate,
    timezone,
    showTime,
    showTimezones,
  } = props;

  const tzGuess = moment.tz.guess();
  // find the matching zone within Canada
  const userCanadaTz = Object.entries(CANADA_TIMEZONE_MAP).find(
    (zone) => zone[1].includes(tzGuess) || zone[0] === tzGuess
  );
  // return the tz name OR use the default if not within Canada.
  const userTz = userCanadaTz ? userCanadaTz[0] : DEFAULT_TIMEZONE;
  let formTimezone;
  if (timezoneFieldProps) {
    const formValues = useSelector((state) => getFormValues(meta.form)(state));
    formTimezone = formValues[timezoneFieldProps.name];
  }

  const defaultTimezone = formTimezone ?? timezone ?? userTz;

  const [selectedTimezone, setTimezone] = useState(defaultTimezone);
  moment.tz.setDefault(defaultTimezone);

  const [selectedDatetime, setDatetime] = useState(input.value);
  // add user tz to select list if not included so they can translate
  const timezones = showTimezones.includes(userTz) ? showTimezones : [userTz, ...showTimezones];
  const timezoneOptions = timezones.map((item) => {
    return { label: item, value: item };
  });

  const datePickerFormat = (value) => {
    const format = displayFormat ?? showTime ? DATETIME_TZ_INPUT_FORMAT : DATE_TZ_INPUT_FORMAT;
    return value ? moment.tz(value, selectedTimezone).format(format) : "";
  };

  const updateFormValues = (datetime) => {
    setDatetime(datetime);
    if (timezoneFieldProps) {
      props.change(meta.form, timezoneFieldProps.name, selectedTimezone);
    }
    return input.onChange(datetime);
  };

  useEffect(() => {
    if (timezone) {
      setTimezone(timezone);
    }
  }, [timezone]);

  useEffect(() => {
    if (input.value) {
      setDatetime(input.value);
    }
  }, [input.value]);

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
        allowClear
        showNow
        disabled={disabled}
        showTime={!!showTime && { format: "HH:mm" }}
        format={datePickerFormat}
        value={selectedDatetime ? moment(selectedDatetime) : null}
        validate={validate}
        onOpenChange={(open) => {
          if (!open) {
            updateFormValues(selectedDatetime);
          }
        }}
        onChange={(val) => {
          updateFormValues(val);
        }}
        onSelect={(val) => {
          setDatetime(val);
        }}
        renderExtraFooter={() =>
          timezoneFieldProps && (
            <Form.Item label="Timezone" gutter={8} className="padding-md--top">
              <Field
                id={timezoneFieldProps?.name}
                name={timezoneFieldProps?.name}
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
          )
        }
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
