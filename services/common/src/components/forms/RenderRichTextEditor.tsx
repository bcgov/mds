import React, { FC, useContext, useMemo } from "react";
import { Form } from "antd";
import { BaseInputProps, BaseViewInput, getFormItemLabel } from "./BaseInput";
import { FormContext } from "./FormWrapper";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

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
}) => {
  const { isEditMode } = useContext(FormContext);

  const handleAddImage = (data) => {
    // just a click handler for the image button,
    // everything else will have to be implemented
    console.log("image data", data);
  };
  const colorOptions = ["#003366", "white", "#fcba19", "#d8292f", "#2e8540", "#313132", "black"];
  const toolbarOptions = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: colorOptions }, { background: colorOptions }, "font", "align"],
    ["link", "video"],
  ];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        // handlers: { image: handleAddImage },// TODO: add image to toolBarOptions and implement handler
      },
    }),
    []
  );

  const handleChange = (newValue) => {
    input.onChange(newValue);
  };

  if (!isEditMode) {
    return <BaseViewInput value={parse(DOMPurify.sanitize(input.value))} label={label} />;
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
        <ReactQuill
          readOnly={disabled}
          defaultValue={defaultValue}
          placeholder={placeholder}
          theme="snow"
          value={input.value}
          onChange={handleChange}
          modules={modules}
        />
        {help && <div className={`form-item-help ${input.name}-form-help`}>{help}</div>}
      </>
    </Form.Item>
  );
};

export default RenderRichTextEditor;
