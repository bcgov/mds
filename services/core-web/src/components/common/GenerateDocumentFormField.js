import React from "react";
import { Field } from "redux-form";
import { currencyMask } from "@common/utils/helpers";
import { required, number, currency } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  field: CustomPropTypes.documentFormSpecField.isRequired,
};

const FIELDS_COMPONENT = {
  CHECKBOX: renderConfig.CHECKBOX,
  AUTOCOMPLETE: renderConfig.AUTOCOMPLETE,
  AUTO_SIZE_FIELD: renderConfig.AUTO_SIZE_FIELD,
  CASCADER: renderConfig.CASCADER,
  DATE: renderConfig.DATE,
  TIME: renderConfig.TIME,
  YEAR: renderConfig.YEAR,
  FIELD: renderConfig.FIELD,
  CURRENCY: renderConfig.FIELD,
  SCROLL_FIELD: renderConfig.SCROLL_FIELD,
  SELECT: renderConfig.SELECT,
  LARGE_SELECT: renderConfig.LARGE_SELECT,
  MULTI_SELECT: renderConfig.MULTI_SELECT,
  RADIO: renderConfig.RADIO,
  GROUPED_SELECT: renderConfig.GROUPED_SELECT,
  MINE_SELECT: renderConfig.MINE_SELECT,
};

const GenerateDocumentFormField = (props) => (
  <Field
    id={props.field.id}
    name={props.field.id}
    label={props.field.label}
    placeholder={props.field.placeholder}
    component={FIELDS_COMPONENT[props.field.type]}
    validate={props.field.required ? [required] : null}
    {...props}
  />
);

const GenerateDocumentFormFieldCurrency = (props) => (
  <GenerateDocumentFormField
    {...props}
    {...currencyMask}
    validate={props.field.required ? [required, number, currency] : [number, currency]}
  />
);

const FIELDS = {
  CHECKBOX: GenerateDocumentFormField,
  AUTOCOMPLETE: GenerateDocumentFormField,
  AUTO_SIZE_FIELD: GenerateDocumentFormField,
  CASCADER: GenerateDocumentFormField,
  DATE: GenerateDocumentFormField,
  TIME: GenerateDocumentFormField,
  YEAR: GenerateDocumentFormField,
  FIELD: GenerateDocumentFormField,
  CURRENCY: GenerateDocumentFormFieldCurrency,
  SCROLL_FIELD: GenerateDocumentFormField,
  SELECT: GenerateDocumentFormField,
  LARGE_SELECT: GenerateDocumentFormField,
  MULTI_SELECT: GenerateDocumentFormField,
  RADIO: GenerateDocumentFormField,
  GROUPED_SELECT: GenerateDocumentFormField,
  MINE_SELECT: GenerateDocumentFormField,
};

GenerateDocumentFormField.propTypes = propTypes;
GenerateDocumentFormFieldCurrency.propTypes = propTypes;

export const getGenerateDocumentFormField = (field) => {
  const FormField = FIELDS[field.type];
  return <FormField field={field} />;
};

export default getGenerateDocumentFormField;
