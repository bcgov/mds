import React, { FC, useRef } from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/pro-regular-svg-icons";
import { getNoticeOfWork, getNOWProgress } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { resolvePermitPackageFileReference } from "@mds/common/utils/permitPackageDocuments";
import { parseConditionText } from "@mds/common/utils/conditionTokenParser";

const BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP =
  "This file has either been removed from the permit package or deleted altogether.";

// React 16 here, no useId() - a module-level counter gives each component instance a stable
// prefix, combined with the token's own index for uniqueness across multiple broken references
// within one instance.
let instanceCounter = 0;

interface ConditionVariableTextProps {
  text: string;
}

// Renders a permit condition's text, wrapping each `{variable}` token in the existing yellow
// highlight — except for a `{permit_package_file:<guid>}` reference, which is resolved to its
// live "1.N Title" label and rendered as a green label instead. Replaces react-highlighter's
// <Highlight> here because it can only apply one uniform style to every match, and these two
// token types now need to look different.
const ConditionVariableText: FC<ConditionVariableTextProps> = ({ text }) => {
  const noticeOfWork = useSelector(getNoticeOfWork);
  const nowProgress = useSelector(getNOWProgress);

  const instanceIdRef = useRef<number>();
  if (instanceIdRef.current === undefined) {
    instanceCounter += 1;
    instanceIdRef.current = instanceCounter;
  }

  const parts: React.ReactNode[] = parseConditionText(text).map((token, i) => {
    if (token.type === "text") {
      return <span key={`text-${i}`}>{token.value}</span>;
    }

    if (token.type === "variable") {
      return (
        <mark key={`hl-${i}`} className="highlight">
          {token.value}
        </mark>
      );
    }

    const resolved = resolvePermitPackageFileReference(token.guid, noticeOfWork, nowProgress);
    if (resolved.found) {
      return (
        <span key={`ref-${i}`} className="permit-package-file-reference">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="permit-package-file-reference-icon"
            aria-hidden="true"
          />
          {resolved.label}
        </span>
      );
    }

    const descriptionId = `permit-package-file-broken-description-${instanceIdRef.current}-${i}`;
    return (
      <Tooltip key={`ref-${i}`} title={BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP}>
        <span className="permit-package-file-reference-broken" tabIndex={0} aria-describedby={descriptionId}>
          <FontAwesomeIcon
            icon={faExclamationCircle}
            className="permit-package-file-reference-broken-icon"
            aria-hidden="true"
          />
          <span className="permit-package-file-reference-label">Reference unavailable</span>
          <span id={descriptionId} className="sr-only">
            {BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP}
          </span>
        </span>
      </Tooltip>
    );
  });

  return <>{parts}</>;
};

export default ConditionVariableText;
