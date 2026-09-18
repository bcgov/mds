import React, { FC } from "react";
import { Modal, Segmented, Input, Radio, Form } from "antd";
import { getFormItemLabel } from "../forms/BaseInput";

export const ERROR_SEVERITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export interface ReportErrorDetails {
  severity: string;
  description: string;
  seenBefore?: boolean | null;
}

interface ReportErrorModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (details: ReportErrorDetails) => void;
}

const DESCRIPTION_MAX_LENGTH = 500;

const SEEN_BEFORE_CHOICES = {
  YES: "yes",
  NO: "no",
  NOT_SURE: "not_sure",
} as const;

type SeenBeforeChoice = typeof SEEN_BEFORE_CHOICES[keyof typeof SEEN_BEFORE_CHOICES];

const SEEN_BEFORE_OPTIONS = [
  { label: "Yes", value: SEEN_BEFORE_CHOICES.YES },
  { label: "No", value: SEEN_BEFORE_CHOICES.NO },
  { label: "Not sure", value: SEEN_BEFORE_CHOICES.NOT_SURE },
];

interface ReportErrorFormValues {
  severity: string;
  description: string;
  seenBefore?: SeenBeforeChoice;
}

export const ReportErrorModal: FC<ReportErrorModalProps> = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm<ReportErrorFormValues>();

  const handleFinish = (values: ReportErrorFormValues) => {
    let seenBeforeValue: boolean | null | undefined = undefined;
    if (values.seenBefore === SEEN_BEFORE_CHOICES.YES) {
      seenBeforeValue = true;
    } else if (values.seenBefore === SEEN_BEFORE_CHOICES.NO) {
      seenBeforeValue = false;
    } else if (values.seenBefore === SEEN_BEFORE_CHOICES.NOT_SURE) {
      seenBeforeValue = null;
    }

    onSubmit({ severity: values.severity, description: values.description, seenBefore: seenBeforeValue });
  };

  return (
    <Modal
      title="Report an error"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Send"
      cancelText="Cancel"
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        layout="vertical"
        className="common-form"
        initialValues={{ severity: ERROR_SEVERITY.LOW }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="severity"
          label="Severity"
          rules={[{ required: true, message: "Please select a severity" }]}
        >
          <Segmented
            className="report-error-severity"
            options={[ERROR_SEVERITY.LOW, ERROR_SEVERITY.MEDIUM, ERROR_SEVERITY.HIGH]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="What were you trying to do?"
          rules={[{ required: true, message: "Please describe what you were doing" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe what you were doing when this happened"
            showCount
            maxLength={DESCRIPTION_MAX_LENGTH}
          />
        </Form.Item>

        <Form.Item name="seenBefore" label={getFormItemLabel("Have you experienced this issue before?", false)}>
          <Radio.Group options={SEEN_BEFORE_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportErrorModal;
