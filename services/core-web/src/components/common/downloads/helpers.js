/**
 * These functions have been extracted from the download file package flow found in
 * ManageDocumentsTab, DownloadAllDocumentsButton, PermitPackage, ReferralConsultationPackage components.
 * Further work needs to be done to refactor all of that into a common component/workflow, for now we
 * pull out some common non-React functions to be available for reuse.
 */

export const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
};

export const downloadDocument = (url) => {
  const a = document.createElement("a");
  a.href = url.url;
  a.download = url.filename;
  a.style.display = "none";
  document.body.append(a);
  a.click();
  a.remove();
};
