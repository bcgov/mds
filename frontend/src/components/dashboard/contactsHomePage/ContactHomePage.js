import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { change } from "redux-form";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@/constants/strings";
import { openModal, closeModal } from "@/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import {
  fetchParties,
  createParty,
  fetchPartyRelationshipTypes,
} from "@/actionCreators/partiesActionCreator";
import * as FORM from "@/constants/forms";
import { fetchProvinceCodes } from "@/actionCreators/staticContentActionCreator";
import * as Permission from "@/constants/permissions";
import { getDropdownProvinceOptions } from "@/selectors/staticContentSelectors";
import {
  getParties,
  getPartyPageData,
  getPartyRelationshipTypeHash,
  getPartyRelationshipTypesList,
} from "@/selectors/partiesSelectors";
import ContactSearch from "@/components/dashboard/contactsHomePage/ContactSearch";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as router from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import AddButton from "@/components/common/AddButton";

/**
 * @class ContactHomePage contains a list, contact search, and create new contact button
 *
 */

const propTypes = {
  fetchParties: PropTypes.func.isRequired,
  fetchProvinceCodes: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  fetchPartyRelationshipTypes: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: PropTypes.objectOf(CustomPropTypes.partyPageData).isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  parties: PropTypes.arrayOf(CustomPropTypes.party).isRequired,
  partyRelationshipTypesList: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  relationshipTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class ContactHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isLoaded: false,
    params: {
      page: Strings.DEFAULT_PAGE,
      per_page: Strings.DEFAULT_PER_PAGE,
      type: "PER",
      ...this.params,
    },
  };

  componentWillMount() {
    // Fetch dependencies from API
    this.props.fetchPartyRelationshipTypes();
    this.props.fetchProvinceCodes();
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
        page,
        per_page,
        relationships: "mine_party_appt",
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

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Default per_page -- overwrite if provided
      per_page: Strings.DEFAULT_PER_PAGE,
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
      // Reset page number
      page: Strings.DEFAULT_PAGE,
    };

    this.props.history.push(router.CONTACT_HOME_PAGE.dynamicRoute(updatedParams));
    this.setState(
      {
        params: updatedParams,
      },
      // Fetch parties once state has been updated
      () => this.renderDataFromURL()
    );
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

  handleNameFieldReset = () => {
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "party_name", null);
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "first_name", null);
    this.props.change(FORM.CONTACT_ADVANCED_SEARCH, "last_name", null);
  };

  openAddContactModal(event, fetchData, title, provinceOptions) {
    event.preventDefault();
    this.props.openModal({
      props: {
        fetchData,
        title,
        provinceOptions,
        partyRelationshipTypesList: this.props.partyRelationshipTypesList,
      },
      widthSize: "75vw",
      content: modalConfig.ADD_CONTACT,
    });
  }

  render() {
    const { page, per_page } = this.state.params;
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div className="inline-flex between center-mobile">
            <div>
              <h1>Contact Lookup</h1>
              <p>To find a contact profile, search in the list section below.</p>
            </div>
            <AuthorizationWrapper permission={Permission.EDIT_PARTIES}>
              <AddButton
                onClick={(event) =>
                  this.openAddContactModal(
                    event,
                    this.renderDataFromURL,
                    ModalContent.ADD_CONTACT,
                    this.props.provinceOptions
                  )
                }
              >
                {ModalContent.ADD_CONTACT}
              </AddButton>
            </AuthorizationWrapper>
          </div>
        </div>
        <div className="landing-page__content">
          <ContactSearch
            handleNameFieldReset={this.handleNameFieldReset}
            initialValues={this.state.params}
            partyRelationshipTypesList={this.props.partyRelationshipTypesList}
            fetchParties={this.props.fetchParties}
            handleSearch={this.handleSearch}
          />
          <div>
            <div className="tab__content ">
              <ContactList
                isLoaded={this.state.isLoaded}
                parties={this.props.parties}
                relationshipTypeHash={this.props.relationshipTypeHash}
                handleSearch={this.handleSearch}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                paginationPerPage={Number(per_page)}
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
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  parties: getParties(state),
  pageData: getPartyPageData(state),
  provinceOptions: getDropdownProvinceOptions(state),
  relationshipTypeHash: getPartyRelationshipTypeHash(state),
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchParties,
      fetchProvinceCodes,
      createParty,
      fetchPartyRelationshipTypes,
      openModal,
      closeModal,
      change,
    },
    dispatch
  );

ContactHomePage.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContactHomePage);
