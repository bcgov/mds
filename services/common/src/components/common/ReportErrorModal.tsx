import React, { FC, useState } from "react";
import { Modal, Segmented, Input, Radio, Typography } from "antd";

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

export const ReportErrorModal: FC<ReportErrorModalProps> = ({ open, onCancel, onSubmit }) => {
  const [severity, setSeverity] = useState<string>(ERROR_SEVERITY.LOW);
  const [description, setDescription] = useState<string>("");
  const [seenBefore, setSeenBefore] = useState<SeenBeforeChoice | undefined>(undefined);

  const handleSubmit = () => {
    let seenBeforeValue: boolean | null | undefined = undefined;
    if (seenBefore === SEEN_BEFORE_CHOICES.YES) {
      seenBeforeValue = true;
    } else if (seenBefore === SEEN_BEFORE_CHOICES.NO) {
      seenBeforeValue = false;
    } else if (seenBefore === SEEN_BEFORE_CHOICES.NOT_SURE) {
      seenBeforeValue = null;
    }

    onSubmit({ severity, description, seenBefore: seenBeforeValue });
  };

  return (
    <Modal
      title="Report an error"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Send"
      okButtonProps={{ disabled: description.trim().length === 0 }}
      cancelText="Cancel"
    >
      <Typography.Paragraph strong>Severity</Typography.Paragraph>
      <Segmented
        options={[ERROR_SEVERITY.LOW, ERROR_SEVERITY.MEDIUM, ERROR_SEVERITY.HIGH]}
        value={severity}
        onChange={(value) => setSeverity(value as string)}
      />

      <Typography.Paragraph strong className="margin-large--top">
        What were you trying to do?
      </Typography.Paragraph>
      <Input.TextArea
        rows={4}
        placeholder="Describe what you were doing when this happened"
        showCount
        maxLength={DESCRIPTION_MAX_LENGTH}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Typography.Paragraph strong className="margin-large--top">
        Have you experienced this issue before? (optional)
      </Typography.Paragraph>
      <Radio.Group
        options={SEEN_BEFORE_OPTIONS}
        value={seenBefore}
        onChange={(e) => setSeenBefore(e.target.value)}
      />
    </Modal>
  );
};

export default ReportErrorModal;
