import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Button, Popconfirm } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { getLockedSystemNtrDoc } from "@mds/common/utils/helpers";
import { getDraftPermitAmendmentForNOW } from "@mds/common/redux/selectors/permitSelectors";
import {
  isFileReferencedInConditions,
  shouldShowSystemGeneratedSection,
  splitPermitPackageCoreDocuments,
} from "@mds/common/utils/permitPackageDocuments";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "../noticeOfWork/applications/NOWSubmissionDocuments";
import { allSelectedHaveTitles } from "../noticeOfWork/applications/permitPackageTitleColumn";

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  finalDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  finalSubmissionDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  noticeOfWorkGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

export const EditFinalPermitDocumentPackage = (props) => {
  const draftPermitAmendment = useSelector(getDraftPermitAmendmentForNOW);
  const coreDocuments = props.documents ?? props.noticeOfWork.documents ?? [];
  const submissionDocuments = props.noticeOfWork.filtered_submission_documents ?? [];

  // Each Core document appears in exactly one section, matching the Manage Documents tab's tables.
  const showSystemGenerated = shouldShowSystemGeneratedSection(
    props.noticeOfWork,
    draftPermitAmendment
  );
  const {
    application: applicationCoreDocs,
    systemGenerated: systemGeneratedDocs,
    government: governmentDocs,
    excludedFromSections: excludedFromSectionsDocs,
  } = splitPermitPackageCoreDocuments(coreDocuments, showSystemGenerated);

  const applicationDocuments = submissionDocuments.concat(
    applicationCoreDocs.map((doc) => {
      return {
        preamble_author: doc.preamble_author,
        preamble_date: doc.preamble_date,
        preamble_title: doc.preamble_title,
        now_application_document_xref_guid: doc.now_application_document_xref_guid,
        is_referral_package: doc.is_referral_package,
        is_final_package: doc.is_final_package,
        is_consultation_package: doc.is_consultation_package,
        description: doc.description,
        mine_document_guid: doc.mine_document.mine_document_guid,
        filename: doc.mine_document.document_name,
        document_manager_guid: doc.mine_document.document_manager_guid,
        notForImport: true,
        ...doc,
      };
    })
  );

  const applicationCoreXrefByMineGuid = applicationCoreDocs.reduce((acc, doc) => {
    acc[doc.mine_document.mine_document_guid] = doc.now_application_document_xref_guid;
    return acc;
  }, {});

  const governmentKeys = governmentDocs.map((doc) => doc.now_application_document_xref_guid);
  const systemGeneratedKeys = systemGeneratedDocs.map(
    (doc) => doc.now_application_document_xref_guid
  );

  const systemGeneratedNtrDoc = getLockedSystemNtrDoc(
    coreDocuments,
    props.noticeOfWork.locked_ntr_guid
  );
  const lockedCoreRowKeys = systemGeneratedNtrDoc
    ? [systemGeneratedNtrDoc.now_application_document_xref_guid]
    : [];

  const withLockedRows = (keys, tableKeys) => {
    const missingLocked = lockedCoreRowKeys.filter(
      (key) => tableKeys.includes(key) && !keys.includes(key)
    );
    return missingLocked.length ? [...keys, ...missingLocked] : keys;
  };

  const finalCoreDocuments = props.finalDocuments || [];

  // Separate selection state per table, so a change in one table never clears another's selection.
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState(() => [
    ...(props.finalSubmissionDocuments || []),
    ...applicationCoreDocs
      .filter((doc) => finalCoreDocuments.includes(doc.now_application_document_xref_guid))
      .map((doc) => doc.mine_document.mine_document_guid),
  ]);
  const [selectedGovernmentRows, setSelectedGovernmentRows] = useState(() =>
    withLockedRows(
      finalCoreDocuments.filter((key) => governmentKeys.includes(key)),
      governmentKeys
    )
  );
  const [selectedSystemGeneratedRows, setSelectedSystemGeneratedRows] = useState(() =>
    withLockedRows(
      finalCoreDocuments.filter((key) => systemGeneratedKeys.includes(key)),
      systemGeneratedKeys
    )
  );

  // Titles are tracked per table, keyed by the same row keys each table uses for selection.
  const buildTitles = (docs, getKey) =>
    (docs || []).reduce((acc, doc) => {
      const key = getKey(doc);
      if (key) {
        acc[key] = doc.preamble_title ?? "";
      }
      return acc;
    }, {});

  const [submissionTitles, setSubmissionTitles] = useState(() =>
    buildTitles(applicationDocuments, (doc) => doc.mine_document_guid ?? doc.id)
  );
  const [coreTitles, setCoreTitles] = useState(() =>
    buildTitles(
      [...governmentDocs, ...systemGeneratedDocs],
      (doc) => doc.now_application_document_xref_guid
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (setTitles) => (key, value) =>
    setTitles((titles) => ({ ...titles, [key]: value }));

  const selectedApplicationCoreXrefs = selectedSubmissionRows
    .map((key) => applicationCoreXrefByMineGuid[key])
    .filter(Boolean);
  // Documents excluded from the sections aren't shown in the modal,
  // so they keep whatever package state they already have.
  const excludedFromSectionsFinalKeys = excludedFromSectionsDocs
    .map((doc) => doc.now_application_document_xref_guid)
    .filter((key) => finalCoreDocuments.includes(key));
  const selectedCoreRows = [
    ...new Set([
      ...selectedGovernmentRows,
      ...selectedSystemGeneratedRows,
      ...selectedApplicationCoreXrefs,
      ...excludedFromSectionsFinalKeys,
    ]),
  ];

  const handleSubmit = () => {
    const applicationCoreTitles = Object.entries(applicationCoreXrefByMineGuid).reduce(
      (acc, [mineGuid, xrefGuid]) => {
        if (mineGuid in submissionTitles) {
          acc[xrefGuid] = submissionTitles[mineGuid];
        }
        return acc;
      },
      {}
    );
    setIsSubmitting(true);
    return props
      .onSubmit(selectedCoreRows, selectedSubmissionRows, {
        coreTitles: { ...coreTitles, ...applicationCoreTitles },
        submissionTitles,
      })
      .finally(() => setIsSubmitting(false));
  };

  const removedCoreGuids = finalCoreDocuments.filter((guid) => !selectedCoreRows.includes(guid));

  const removedSubmissionXrefGuids = (props.finalSubmissionDocuments || [])
    .filter((mineDocGuid) => !selectedSubmissionRows.includes(mineDocGuid))
    .map(
      (mineDocGuid) =>
        submissionDocuments.find((doc) => doc.mine_document_guid === mineDocGuid)
          ?.now_application_document_xref_guid
    )
    .filter(Boolean);

  const isRemovingReferencedFile = [...removedCoreGuids, ...removedSubmissionXrefGuids].some((guid) =>
    isFileReferencedInConditions(draftPermitAmendment?.conditions, guid)
  );

  const isMissingTitles =
    !allSelectedHaveTitles(selectedSubmissionRows, [], submissionTitles) ||
    !allSelectedHaveTitles(selectedGovernmentRows, lockedCoreRowKeys, coreTitles) ||
    !allSelectedHaveTitles(selectedSystemGeneratedRows, lockedCoreRowKeys, coreTitles);

  return (
    <div>
      <h4>Application Documents</h4>
      <NOWSubmissionDocuments
        now_application_guid={props.noticeOfWorkGuid}
        documents={applicationDocuments}
        importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
        selectedRows={{ selectedSubmissionRows, setSelectedSubmissionRows }}
        packageTitles={{
          titles: submissionTitles,
          onTitleChange: handleTitleChange(setSubmissionTitles),
        }}
        isPackageModal
        isAdminView
        isViewMode
      />
      <br />
      <h4>Government Documents</h4>
      <NOWDocuments
        documents={governmentDocs}
        isViewMode
        selectedRows={{
          selectedCoreRows: selectedGovernmentRows,
          setSelectedCoreRows: (keys) =>
            setSelectedGovernmentRows(withLockedRows(keys, governmentKeys)),
        }}
        lockedRowKeys={lockedCoreRowKeys}
        packageTitles={{
          titles: coreTitles,
          onTitleChange: handleTitleChange(setCoreTitles),
        }}
        categoriesToShow={["GDO"]}
        isPackageModal
      />
      <br />
      {showSystemGenerated && (
        <>
          <h4>System-generated Documents</h4>
          <NOWDocuments
            documents={systemGeneratedDocs}
            isViewMode
            selectedRows={{
              selectedCoreRows: selectedSystemGeneratedRows,
              setSelectedCoreRows: (keys) =>
                setSelectedSystemGeneratedRows(withLockedRows(keys, systemGeneratedKeys)),
            }}
            lockedRowKeys={lockedCoreRowKeys}
            packageTitles={{
              titles: coreTitles,
              onTitleChange: handleTitleChange(setCoreTitles),
            }}
            categoriesToShow={["AEF"]}
            isPackageModal
          />
          <br />
        </>
      )}
      {isMissingTitles && (
        <p className="right red">
          A title is required for every document selected for the permit package.
        </p>
      )}
      <div className="right center-mobile padding-md--top">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
          disabled={isSubmitting}
        >
          <Button className="full-mobile" disabled={isSubmitting}>
            Cancel
          </Button>
        </Popconfirm>
        {isRemovingReferencedFile ? (
          <Popconfirm
            placement="topRight"
            title="This file is currently being referenced in a permit condition. Removing the file from the permit package will break that reference. Do you wish to continue?"
            onConfirm={() => handleSubmit()}
            okText="Yes"
            cancelText="No"
            disabled={isSubmitting || isMissingTitles}
          >
            <Button
              className="full-mobile"
              type="primary"
              loading={isSubmitting}
              disabled={isMissingTitles}
            >
              <DownloadOutlined className="padding-sm--right icon-sm" />
              Save Application Package
            </Button>
          </Popconfirm>
        ) : (
          <Button
            className="full-mobile"
            type="primary"
            onClick={() => handleSubmit()}
            loading={isSubmitting}
            disabled={isMissingTitles}
          >
            <DownloadOutlined className="padding-sm--right icon-sm" />
            Save Application Package
          </Button>
        )}
      </div>
    </div>
  );
};

EditFinalPermitDocumentPackage.propTypes = propTypes;
EditFinalPermitDocumentPackage.defaultProps = defaultProps;

export default EditFinalPermitDocumentPackage;
