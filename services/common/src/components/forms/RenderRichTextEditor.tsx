import React, { FC, useContext, useMemo } from "react";
import { Input, Form } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormConsumer, FormContext } from "./FormWrapper";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import parse from "html-react-parser";

const RenderRichTextEditor: FC<BaseInputProps> = ({
  label,
  labelSubtitle,
  meta,
  input,
  disabled,
  help,
  required,
  defaultValue,
  id,
  placeholder,
  allowClear,
}) => {
  const { isEditMode } = useContext(FormContext);

  const handleAddImage = (data) => {
    // just a click handler for the image button,
    // everything else will have to be implemented
    console.log("image data", data);
  };
  const toolbarOptions = isEditMode
    ? [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        ["color", "background", "font", "align"],
        ["link", "image", "video", "formula"],
      ]
    : [];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: { image: handleAddImage },
      },
    }),
    []
  );

  const handleChange = (newValue) => {
    console.log(newValue);
    input.onChange(newValue);
  };

  if (!isEditMode) {
    return parse(input.value);
  }

  return (
    <Form.Item
      id={id}
      getValueProps={() => ({ value: input.value })}
      name={input.name}
      required={required}
      validateStatus={meta.touched ? (meta.error && "error") || (meta.warning && "warning") : ""}
      help={
        meta.touched &&
        ((meta.error && <span>{meta.error}</span>) || (meta.warning && <span>{meta.warning}</span>))
      }
      label={getFormItemLabel(label, required, labelSubtitle)}
    >
      <>
        <ReactQuill theme="snow" value={input.value} onChange={handleChange} modules={modules} />
        {help && <div className={`form-item-help ${input.name}-form-help`}>{help}</div>}
      </>
    </Form.Item>
  );
};

export default RenderRichTextEditor;
