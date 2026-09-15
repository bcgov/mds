import React, { FC, MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import Quill from "quill";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getNoticeOfWork, getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { resolvePermitPackageFileReference } from "@mds/common/utils/permitPackageDocuments";
import {
  conditionTextToResolvedQuillDelta,
  quillDeltaToConditionText,
  ConditionDelta,
} from "@mds/common/utils/conditionRichText";
import "@mds/common/components/permits/quill/PermitPackageFileBlot";
import { PERMIT_PACKAGE_FILE_BLOT_SELECTOR } from "@mds/common/components/permits/quill/PermitPackageFileBlot";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuillDelta: any = Quill.import("delta");

interface ConditionRichTextEditorInput {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
}

interface ConditionRichTextEditorProps {
  input: ConditionRichTextEditorInput;
  disabled?: boolean;
  // Populated with the live Quill instance once mounted, so VariableConditionMenu can call insertEmbed/insertText on it directly.
  // This mirrors the inputRef pattern RenderAutoSizeField already uses for the same purpose with a plain textarea.
  quillEditorRef?: MutableRefObject<Quill | null>;
  // Quill sets no ARIA attributes of its own on the contenteditable root.
  // Without this, a screen reader has no accessible name or indication this div is even an editable text field.
  ariaLabel?: string;
}

// Renders {permit_package_file:<guid>} tokens as live green/red pill embeds
// Also syncs typed changes back to input.onChange as the same plain-text shape (via quillDeltaToConditionText)
const ConditionRichTextEditor: FC<ConditionRichTextEditorProps> = ({
  input,
  disabled,
  quillEditorRef,
  ariaLabel = "Condition text",
}) => {
  const noticeOfWork = useSelector(getNoticeOfWork);
  const nowProgress = useSelector(getNOWProgress);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (quillEditorRef) {
      quillEditorRef.current = quillRef.current?.getEditor() ?? null;
    }
    return () => {
      if (quillEditorRef) {
        quillEditorRef.current = null;
      }
    };
  }, [quillEditorRef]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }
    editor.root.setAttribute("role", "textbox");
    editor.root.setAttribute("aria-multiline", "true");
    editor.root.setAttribute("aria-label", ariaLabel);
  }, [ariaLabel]);

  const resolveReference = (guid: string) =>
    resolvePermitPackageFileReference(guid, noticeOfWork, nowProgress);

  // A stable handle to the latest resolveReference, for the clipboard matcher below - that
  // matcher is registered once on mount, so it needs a way to reach current NoW/document data on
  // every paste rather than whatever was in scope the moment it was registered.
  const resolveReferenceRef = useRef(resolveReference);
  resolveReferenceRef.current = resolveReference;

  // Only used for the editor's initial mount content - deliberately not re-run on every
  // keystroke or Redux update, since ReactQuill's `defaultValue` is uncontrolled.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialDelta = useMemo(() => conditionTextToResolvedQuillDelta(input.value ?? "", resolveReference), []);

  // Quill's default paste handling doesn't know how to reconstruct our custom embed from pasted
  // HTML (whether pasted from this same editor, another condition's editor, or a completely
  // different NoW/context where the guid may not even resolve) - it instead falls back to
  // walking the chip's internal DOM (icon markup, guard characters, label text) as plain
  // content, producing garbled/duplicated text. This matcher replaces that default handling:
  // any pasted node carrying our blot's class is rebuilt as a clean embed, re-resolved against
  // *this* editor's own live data rather than trusting whatever the source editor rendered.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }
    editor.clipboard.addMatcher(PERMIT_PACKAGE_FILE_BLOT_SELECTOR, (node: HTMLElement, delta: unknown) => {
      const guid = node.getAttribute("data-guid");
      if (!guid) {
        return delta;
      }
      return new QuillDelta().insert({ permitPackageFile: { guid, ...resolveReferenceRef.current(guid) } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the editor's content in sync when input.value changes from OUTSIDE this editor's own
  // typing (e.g. a Redux Form reset/cancel, or the field being reinitialized) - the guard
  // against the value the editor already shows means the user's own typing never gets its
  // cursor position clobbered by this effect re-applying what they just typed.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }
    const currentText = quillDeltaToConditionText(editor.getContents() as unknown as ConditionDelta);
    const nextText = input.value ?? "";
    if (currentText !== nextText) {
      const delta = conditionTextToResolvedQuillDelta(nextText, resolveReference);
      editor.setContents(delta as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value]);

  const handleChange = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }
    input.onChange(quillDeltaToConditionText(editor.getContents() as unknown as ConditionDelta));
  };

  const handleBlur = () => {
    input.onBlur?.(input.value ?? "");
  };

  return (
    <ReactQuill
      ref={quillRef}
      readOnly={disabled}
      theme="snow"
      defaultValue={initialDelta}
      onChange={handleChange}
      onBlur={handleBlur}
      modules={{ toolbar: false }}
      className="condition-rich-text-editor"
    />
  );
};

export default ConditionRichTextEditor;
