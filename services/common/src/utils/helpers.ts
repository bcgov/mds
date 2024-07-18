import { isArray } from "lodash";
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import { AMS_AUTHORIZATION_TYPES } from "@mds/common/constants/enums";

const transformAuthorizations = (
  valuesFromForm: any,
  projectSummaryAuthorizationTypesArray: any
) => {
  const { authorizations = {}, project_summary_guid } = valuesFromForm;

  const transformAuthorization = (type, authorization) => {
    return { ...authorization, project_summary_authorization_type: type, project_summary_guid };
  };
  let updatedAuthorizations = [];
  let newAmsAuthorizations = [];
  let amendAmsAuthorizations = [];

  projectSummaryAuthorizationTypesArray.forEach((type) => {
    const authsOfType = authorizations[type];
    if (authsOfType) {
      if (isArray(authsOfType)) {
        const formattedAuthorizations = authsOfType.map((a) => {
          return transformAuthorization(type, a);
        });
        updatedAuthorizations = updatedAuthorizations.concat(formattedAuthorizations);
      } else {
        newAmsAuthorizations = newAmsAuthorizations.concat(
          authsOfType?.NEW.map((a) =>
            transformAuthorization(type, {
              ...a,
              project_summary_permit_type: [AMS_AUTHORIZATION_TYPES.NEW],
            })
          )
        );
        amendAmsAuthorizations = amendAmsAuthorizations.concat(
          authsOfType?.AMENDMENT.map((a) =>
            transformAuthorization(type, {
              ...a,
              project_summary_permit_type: [AMS_AUTHORIZATION_TYPES.AMENDMENT],
            })
          )
        );
      }
    }
  });
  return {
    authorizations: updatedAuthorizations,
    ams_authorizations: { amendments: amendAmsAuthorizations, new: newAmsAuthorizations },
  };
};

export const formatProjectPayload = (valuesFromForm: any, params: any) => {
  let payloadValues: any = {};
  const { projectSummaryAuthorizationTypesArray } = params;
  const updatedAuthorizations = transformAuthorizations(
    valuesFromForm,
    projectSummaryAuthorizationTypesArray
  );
  const values = removeNullValuesRecursive(valuesFromForm);
  payloadValues = {
    ...values,
    ...updatedAuthorizations,
  };
  delete payloadValues.authorizationTypes;
  return payloadValues;
};
