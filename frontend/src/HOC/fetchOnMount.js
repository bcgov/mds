/* eslint-disable */
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { getOptionsLoaded } from "@/selectors/staticContentSelectors";
import {
  fetchMineDisturbanceOptions,
  fetchStatusOptions,
  fetchRegionOptions,
  fetchMineTenureTypes,
  fetchMineTailingsRequiredDocuments,
  fetchExpectedDocumentStatusOptions,
  fetchPermitStatusOptions,
  fetchApplicationStatusOptions,
  fetchMineIncidentFollowActionOptions,
  fetchMineIncidentDeterminationOptions,
  setOptionsLoaded,
  fetchProvinceCodes,
  fetchMineComplianceCodes,
  fetchVarianceStatusOptions,
  fetchMineCommodityOptions,
} from "@/actionCreators/staticContentActionCreator";

/**
 * @constant FetchOnMount - Higher Order Component that checks if user has the has the correct permission, if so, render component, else render a NullScreen.
 * NOTE: feature flagging, in order to hide routes that Are not ready to be in PROD, pass in `inDevelopment` or 'inTesting` param to keep the content environment specific.
 */

export const FetchOnMount = (WrappedComponent) => {
  const fetchOnMount = (props) => {};

  hoistNonReactStatics(fetchOnMount, WrappedComponent);

  const mapStateToProps = (state) => ({
    optionsLoaded: getOptionsLoaded(state),
  });

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        fetchMineDisturbanceOptions,
        fetchStatusOptions,
        fetchRegionOptions,
        fetchMineTenureTypes,
        fetchMineTailingsRequiredDocuments,
        fetchExpectedDocumentStatusOptions,
        fetchPermitStatusOptions,
        fetchApplicationStatusOptions,
        fetchMineIncidentFollowActionOptions,
        fetchMineIncidentDeterminationOptions,
        setOptionsLoaded,
        fetchProvinceCodes,
        fetchMineComplianceCodes,
        fetchVarianceStatusOptions,
        fetchMineCommodityOptions,
      },
      dispatch
    );

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(fetchOnMount);
};

export default FetchOnMount;
