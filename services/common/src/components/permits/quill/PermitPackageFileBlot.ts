import ReactQuill from "react-quill";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/pro-regular-svg-icons";
import { PermitPackageFileEmbedValue } from "@mds/common/utils/conditionRichText";

const Embed = ReactQuill.Quill.import("blots/embed");

export const PERMIT_PACKAGE_FILE_BLOT_NAME = "permitPackageFile";
const PERMIT_PACKAGE_FILE_BLOT_CLASS = "permit-package-file-blot";
export const PERMIT_PACKAGE_FILE_BLOT_SELECTOR = `.${PERMIT_PACKAGE_FILE_BLOT_CLASS}`;

export const BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP =
  "This file has either been removed from the permit package or deleted altogether.";

// Because screen readers frequently dont announce bare title tooltips (used for the broken reference pill),
// the broken pill also gets a visually-hidden aria-describedby target carrying the same text. 
// Counter-based since this file isn't a React component (no useId) and several instances of the same guid could appear in one condition.
let brokenReferenceDescriptionIdCounter = 0;
const nextBrokenReferenceDescriptionId = () => {
  brokenReferenceDescriptionIdCounter += 1;
  return `permit-package-file-broken-description-${brokenReferenceDescriptionIdCounter}`;
};

export type PermitPackageFileBlotValue = Required<Pick<PermitPackageFileEmbedValue, "guid" | "found">> &
  Pick<PermitPackageFileEmbedValue, "label">;

// Atomic, non-editable inline "chip" embed for a `{permit_package_file:<guid>}` reference, rendered live inside the rich text editor.
// Mirrors the green/red pill markup already used by ConditionVariableText's read-only view, but built with vanilla DOM (Quill blots aren't React).
// Keeps with using fontawesome-svg-core's icon() to reuse the same icon set without a React render tree.
class PermitPackageFileBlot extends Embed {
  static blotName = PERMIT_PACKAGE_FILE_BLOT_NAME;

  static tagName = "span";

  static create(value: PermitPackageFileBlotValue) {
    const node: HTMLElement = super.create(value);
    node.setAttribute("data-guid", value.guid);
    node.setAttribute("data-found", String(value.found));
    if (value.label) {
      node.setAttribute("data-label", value.label);
    }
    PermitPackageFileBlot.renderInto(node, value);
    return node;
  }

  static renderInto(node: HTMLElement, value: PermitPackageFileBlotValue) {
    node.innerHTML = "";
    node.removeAttribute("title");
    node.removeAttribute("tabIndex");
    node.removeAttribute("aria-describedby");

    if (value.found) {
      node.className = `${PERMIT_PACKAGE_FILE_BLOT_CLASS} permit-package-file-reference`;
      node.insertAdjacentHTML(
        "beforeend",
        icon(faCheckCircle, { classes: ["permit-package-file-reference-icon"] }).html.join("")
      );
      const label = document.createElement("span");
      label.className = "permit-package-file-reference-label";
      label.textContent = value.label ?? "";
      node.appendChild(label);
    } else {
      const descriptionId = nextBrokenReferenceDescriptionId();
      node.className = `${PERMIT_PACKAGE_FILE_BLOT_CLASS} permit-package-file-reference-broken`;
      node.setAttribute("title", BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP);
      node.setAttribute("tabIndex", "0");
      node.setAttribute("aria-describedby", descriptionId);
      node.insertAdjacentHTML(
        "beforeend",
        icon(faExclamationCircle, {
          classes: ["permit-package-file-reference-broken-icon"],
        }).html.join("")
      );
      const label = document.createElement("span");
      label.className = "permit-package-file-reference-label";
      label.textContent = "Reference unavailable";
      node.appendChild(label);
      const description = document.createElement("span");
      description.className = "sr-only";
      description.id = descriptionId;
      description.textContent = BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP;
      node.appendChild(description);
    }
  }

  static value(node: HTMLElement): PermitPackageFileBlotValue {
    return {
      guid: node.getAttribute("data-guid") ?? "",
      found: node.getAttribute("data-found") === "true",
      label: node.getAttribute("data-label") ?? undefined,
    };
  }
}

ReactQuill.Quill.register(PermitPackageFileBlot);

export default PermitPackageFileBlot;
