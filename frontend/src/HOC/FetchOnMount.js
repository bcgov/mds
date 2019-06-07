import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import PropTypes from "prop-types";
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
  fetchProvinceCodes: PropTypes.func.isRequired,
  fetchMineComplianceCodes: PropTypes.func.isRequired,
  fetchVarianceStatusOptions: PropTypes.func.isRequired,
  fetchMineIncidentDeterminationOptions: PropTypes.func.isRequired,
  fetchMineCommodityOptions: PropTypes.func.isRequired,
};

export const FetchOnMount = (WrappedComponent) => {
  const fetchOnMount = (props) => {
    if (props.isAuthenticated) {
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
    }
    return <WrappedComponent {...props} />;
  };

  hoistNonReactStatics(fetchOnMount, WrappedComponent);

  const mapStateToProps = (state) => ({
    isAuthenticated: isAuthenticated(state),
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
