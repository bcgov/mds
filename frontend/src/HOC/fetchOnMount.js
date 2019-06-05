import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import PropTypes from "prop-types";
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
  fetchPartyRelationshipTypes,
  fetchMineCommodityOptions,
} from "@/actionCreators/staticContentActionCreator";

/**
 * @constant FetchOnMount - Higher Order Component that makes all staticContent network requests when Home.js loads.
 *
 */

const propTypes = {
  fetchMineDisturbanceOptions: PropTypes.func.isRequired,
  fetchStatusOptions: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchMineTenureTypes: PropTypes.func.isRequired,
  fetchMineTailingsRequiredDocuments: PropTypes.func.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  fetchPermitStatusOptions: PropTypes.func.isRequired,
  fetchApplicationStatusOptions: PropTypes.func.isRequired,
  fetchMineIncidentFollowActionOptions: PropTypes.func.isRequired,
  setOptionsLoaded: PropTypes.func.isRequired,
  fetchProvinceCodes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  fetchMineIncidentDeterminationOptions: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
  optionsLoaded: PropTypes.bool.isRequired,
};

export const FetchOnMount = (WrappedComponent) => {
  const fetchOnMount = (props) => {
    if (!props.optionsLoaded) {
      props.fetchMineDisturbanceOptions();
      props.fetchStatusOptions();
      props.fetchRegionOptions();
      props.fetchMineTenureTypes();
      props.fetchMineTailingsRequiredDocuments();
      props.fetchExpectedDocumentStatusOptions();
      props.fetchPermitStatusOptions();
      props.fetchApplicationStatusOptions();
      props.fetchMineIncidentFollowActionOptions();
      props.fetchProvinceCodes();
      props.fetchMineComplianceCodes();
      props.fetchVarianceStatusOptions();
      props.fetchMineIncidentDeterminationOptions();
      props.fetchMineCommodityOptions();
      props.fetchPartyRelationshipTypes();
      props.setOptionsLoaded();
    }
    return <WrappedComponent {...props} />;
  };

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
        fetchPartyRelationshipTypes,
        fetchMineCommodityOptions,
      },
      dispatch
    );

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(fetchOnMount);
};

FetchOnMount.propTypes = propTypes;
export default FetchOnMount;
