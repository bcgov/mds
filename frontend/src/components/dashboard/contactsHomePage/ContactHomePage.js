import React, { Component } from "react";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import { openModal, closeModal } from "@/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import { fetchParties, fetchPartyRelationshipTypes } from "@/actionCreators/partiesActionCreator";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import {
  getParties,
  getPartyPageData,
  getPartyRelationshipTypeHash,
  getPartyRelationshipTypesList,
} from "@/selectors/partiesSelectors";
import ContactSearch from "@/components/dashboard/contactsHomePage/ContactSearch";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";

/**
 * @class ContactHomePage is the main landing page of the application, currently contains a List and Map View, ability to create a new mine, and search for a mine by name or lat/long.
 *
 */

const propTypes = {
  fetchParties: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: PropTypes.objectOf(CustomPropTypes.partyPageData).isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  relationshipTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class ContactHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isLoaded: false,
    params: { type: "PER", ...this.params },
  };

  componentWillMount() {
    // Fetch dependencies from API
    this.props.fetchPartyRelationshipTypes();
  }

  componentDidMount() {
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const {
      page = this.state.params.page,
      per_page = this.state.params.per_page,
      type = this.state.params.type,
    } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.push(
        router.CONTACT_HOME_PAGE.dynamicRoute({
          page,
          per_page,
          type,
        })
      );
    }
    this.props
      .fetchParties({
        ...parsedParams,
        relationships: "mine_party_appt",
        page,
        per_page,
      })
      .then(() => {
        this.setState({ isLoaded: true });
      });
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps);
    }
  }

  componentWillUnmount() {
    this.setState({ params: {} });
  }

  renderDataFromURL = (nextProps) => {
    const params = nextProps ? nextProps.location.search : this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState({
      params: parsedParams,
      isLoaded: false,
    });
    this.props
      .fetchParties({
        ...parsedParams,
        relationships: "mine_party_appt",
      })
      .then(() => {
        this.setState({ isLoaded: true });
      });
  };

  handleSearch = (searchParams = {}) => {
    this.props.history.push(router.CONTACT_HOME_PAGE.dynamicRoute(searchParams));
    this.setState({
      params: searchParams,
    });
    this.renderDataFromURL();
  };

  onPageChange = (page, per_page) => {
    this.props.history.push(
      router.CONTACT_HOME_PAGE.dynamicRoute({
        ...this.state.params,
        page,
        per_page,
      })
    );
  };

  render() {
    const { page, per_page } = this.state.params;
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile center-mobile">
            <div>
              <h1>Contact Lookup</h1>
              <p>To find a contact profile, search in the list section below.</p>
            </div>
          </div>
        </div>
        <div className="landing-page__content">
          <ContactSearch
            initialValues={this.state.params}
            partyRelationshipTypesList={this.props.partyRelationshipTypesList}
            fetchParties={this.props.fetchParties}
            handleSearch={this.handleSearch}
            handleSubmit={this.handleSubmit}
          />
          {this.state.isLoaded && (
            <div>
              <div className="tab__content ">
                <ContactList
                  parties={this.props.parties}
                  relationshipTypeHash={this.props.relationshipTypeHash}
                />
              </div>
              <div className="center">
                <ResponsivePagination
                  onPageChange={this.onPageChange}
                  currentPage={Number(page)}
                  pageTotal={Number(this.props.pageData.total)}
                  itemsPerPage={Number(per_page)}
                />
              </div>
            </div>
          )}
          {!this.state.isLoaded && <Loading />}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  parties: getParties(state),
  pageData: getPartyPageData(state),
  relationshipTypeHash: getPartyRelationshipTypeHash(state),
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      fetchPartyRelationshipTypes,
      openModal,
      closeModal,
    },
    dispatch
  );

ContactHomePage.propTypes = propTypes;

export default compose(
  AuthorizationGuard(Permission.IN_DEVELOPMENT),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ContactHomePage);
