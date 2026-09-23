import React, { FC, MutableRefObject, useState } from "react";
import { useSelector } from "react-redux"
import { Button, Dropdown, MenuProps, Row, Space, Tooltip } from "antd";
import Quill from "quill";
import { change, getFormValues } from "@mds/common/components/forms/form";
import { getNOWReclamationSummary, getNoticeOfWork, getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { IConditionSection, INoWGeneratedPermit } from "@mds/common/interfaces";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { TextAreaRef } from "antd/lib/input/TextArea";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { getPermitPackageFilesByType, resolvePermitPackageFileReference } from "@mds/common/utils/permitPackageDocuments";
import { insertConditionVariableIntoQuill } from "@mds/common/components/permits/quill/insertConditionVariable";
import { PERMIT_PACKAGE_FILE_TOKEN_PREFIX, getPermitPackageFileToken } from "@mds/common/utils/conditionTokenParser";

export { PERMIT_PACKAGE_FILE_TOKEN_PREFIX, getPermitPackageFileToken };

interface VariableConditionMenuProps {
  isManagementView?: boolean,
  conditionForm: string,
  // Preamble text area and Standard Permit Condition management should still be textarea-based.
  // Preamble and Standard Permit Condition insert via raw textarea splicing.
  // NoW condition editor (rich text, Quill-based) inserts via quillRef instead.
  // Exactly one of the two is expected to be provided by a given caller (cannot be both).
  inputRef?: MutableRefObject<TextAreaRef | null>,
  quillRef?: MutableRefObject<Quill | null>,
};

const VariableConditionMenu: FC<VariableConditionMenuProps> = ({
  isManagementView = false,
  conditionForm,
  inputRef,
  quillRef
}) => {
  const dispatch = useAppDispatch();
  const conditionFormValues = useSelector(getFormValues(conditionForm)) as IConditionSection | INoWGeneratedPermit;
  const reclamationSummary = useSelector(getNOWReclamationSummary);
  const activityTypeOptions = useSelector(getDropdownNoticeOfWorkActivityTypeOptions);
  const noticeOfWork = useSelector(getNoticeOfWork);
  const nowProgress = useSelector(getNOWProgress);
  const { isFeatureEnabled } = useFeatureFlag();
  const isPreambleText = Boolean(conditionFormValues) && "preamble_text" in conditionFormValues;
  const permitPackageFilesEnabled =
    !isManagementView && !isPreambleText && isFeatureEnabled(Feature.CDV_PERMIT_PACKAGE_FILES);
  const [open, setOpen] = useState(false);

  const handleClick: MenuProps['onClick'] = async (event) => {
    if (quillRef?.current) {
      insertConditionVariableIntoQuill(quillRef.current, String(event.key), (guid) =>
        resolvePermitPackageFileReference(guid, noticeOfWork, nowProgress)
      );
      return;
    }

    if (inputRef?.current) {
      inputRef.current.focus();
    }
    const text = isPreambleText
      ? conditionFormValues.preamble_text
      : (conditionFormValues as IConditionSection).condition ?? "";
    const pos = inputRef?.current?.resizableTextArea?.textArea?.selectionStart ?? text.length;
    const newText = `${text.slice(0, pos)} ${event.key} ${text.slice(pos)}`.replace(/ {2,}/g, ' ');
    await dispatch(change(conditionForm, isPreambleText ? "preamble_text" : "condition", newText));

    if (inputRef?.current) {
      const updatedCursorPos = newText.indexOf(event.key, pos) + event.key.length;
      inputRef.current.resizableTextArea.textArea.setSelectionRange(updatedCursorPos, updatedCursorPos);
    }
  }

  const filteredActivityTypes = activityTypeOptions.filter(
    ({ value }) =>
      // filter out activities that do not have reclamation data
      value !== "placer" && value !== "water_supply" && value !== "blasting_operation"
  );
  // The standard permit condition management can see all reclamation options, draft permit tab can only use reclamation activities related to the NoW.
  const reclamationMenuOptions = isManagementView
    ? filteredActivityTypes
    : reclamationSummary;

  const figures = permitPackageFilesEnabled
    ? getPermitPackageFilesByType(noticeOfWork, nowProgress, "FIGURE")
    : [];
  const documents = permitPackageFilesEnabled
    ? getPermitPackageFilesByType(noticeOfWork, nowProgress, "DOCUMENT")
    : [];

  const items: MenuProps['items'] = [
    {
      key: "mine",
      label: "Mine",
      children: [
        {
          key: "{mine_name}",
          label: "Mine Name"
        },
        {
          key: "{mine_no}",
          label: "Mine Number"
        }
      ]
    },
    {
      key: "now",
      label: "Notice of Work",
      children: [
        {
          key: "{proposed_annual_maximum_tonnage}",
          label: "Proposed Annual Tonnage"
        },
        {
          key: "rec",
          label: "Reclamation",
          children: reclamationMenuOptions?.map((activity, i) => (
            {
              key: i,
              label: activity.label,
              children: [
                { key: `{${activity.value}.total}{hectare_unit}`, label: "Total Disturbed Area" },
                { key: `{${activity.value}.cost}`, label: "Cost" }
              ]
            }
          ))
        },
        { key: "{application_type}", label: "Application Type" },
        { key: "{application_dated}", label: "Application Dated" },
        { key: "{application_last_updated_date}", label: "Application Last Updated" }
      ]
    },
    {
      key: "draft",
      label: "Draft Permit",
      children: [
        { key: "{issue_date}", label: "Issue Date" },
        { key: "{authorization_end_date}", label: "Authorization End Date" },
        { key: "{permit_no}", label: "Permit Number" }
      ]
    },
    {
      key: "sec",
      label: "Security",
      children: [
        { key: "{total_liability}", label: "Total Liability" },
        { key: "{liability_adjustment}", label: "Liability Adjustment" },
        { key: "{security_received_date}", label: "Security Received Date" }
      ]
    },
    {
      key: "email",
      label: "Emails",
      children: [
        { key: "{major_mine_inbox}", label: "Major Mine Inbox" },
        {
          key: "{regional_mine_inbox}", label: (
            <Space>
              Regional Mine Inbox
              <Tooltip title={"Defaults to the region associated with the Mine."} placement="right" mouseEnterDelay={0.3}>
                <QuestionCircleOutlined className="icon-sm" />
              </Tooltip>
            </Space>
          )
        }
      ]
    },
    ...(permitPackageFilesEnabled
      ? [
        {
          key: "permitPackageFiles",
          label: "Permit Package Files",
          children: [
            {
              key: "permitPackageFigures",
              label: "Figures",
              children: figures.map((figure) => ({
                key: getPermitPackageFileToken(figure.now_application_document_xref_guid),
                label: `${figure.orderLabel} ${figure.preamble_title}`,
              })),
            },
            {
              key: "permitPackageDocuments",
              label: "Documents",
              children: documents.map((document) => ({
                key: getPermitPackageFileToken(document.now_application_document_xref_guid),
                label: `${document.orderLabel} ${document.preamble_title}`,
              })),
            },
          ],
        },
      ]
      : [])
  ]

  return (
    <Row className="condition-editor-toolbar">
      <Dropdown
        menu={{ items, onClick: handleClick }}
        trigger={["click"]}
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        placement="topLeft"
        getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
      >
        <Button>
          Condition Data Variables
          <Tooltip title={"Click to open the menu, then hover over the categories until you find the variable data you'd like to enter. Put it into your edited Permit Condition by clicking on it. This will populate the edited condition with a variable in the Draft permit screen. The Data from the Application tab will show up correctly in the PDF Draft permit in place of the variable. Please ensure all variable data fields you select have the correct information in the Application tab before adding these fields to your draft permit."}
            placement="right" mouseEnterDelay={0.3} overlayClassName="core-tooltip" >
            <QuestionCircleOutlined className="icon-sm" style={{ marginLeft: 8 }} />
          </Tooltip>
        </Button>
      </Dropdown>
    </Row>
  )
}

export default VariableConditionMenu;
