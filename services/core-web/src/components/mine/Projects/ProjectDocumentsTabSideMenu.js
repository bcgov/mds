import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { PropTypes } from "prop-types";
import { Anchor } from "antd";
import * as routes from "@/constants/routes";

/**
 * @constant ProjectDocumentsTabSideMenu renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    action: PropTypes.string,
    location: PropTypes.shape({ hash: PropTypes.string }),
  }).isRequired,
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  tabSection: PropTypes.string,
};

const defaultProps = { tabSection: "" };

export class ProjectDocumentsTabSideMenu extends Component {
  state = {};

  // eslint-disable-next-line react/sort-comp
  static urlRoute = undefined;

  sideMenuOptions = [
    {
      href: "project-description",
      title: "Project Description",
    },
    {
      href: "irt",
      title: "IRT",
    },
    // {
    //   href: "toc",
    //   title: "TOC",
    // },
    {
      href: "major-mine-application",
      title: "Major Mine Application",
    },
  ];

  componentDidMount() {
    // If the user loads the page with a hash in the URL, start them off at the corresponding All Project Documents section.
    // Note: Because Keycloak authorization adds params to the URL when it redirects, props.location.hash
    // will be contaminated with extra params that we don't need. All we want is the hash that corresponds
    // to the All Project Documents section, so we must parse it out. If the hash is "#state", we must ignore it (see example).
    // For example: #blasting&state=bd74ea1c-09e5-4d7e-810f-d3558969293a&session_state=1c577088-15a8-4ae2-...
    let link =
      this.props.location &&
      this.props.location.hash &&
      !this.props.location.hash.startsWith("#state")
        ? this.props.location.hash
        : undefined;

    if (!link) {
      return;
    }

    // Extracts "#blasting" from "#blasting&state=bd74ea1c-09e5-4d7e-810f-d...", for example.
    link = link.substr(0, link.indexOf("&"));
    this.updateUrlRoute(link);
    this.anchor.handleScrollTo(link);
  }

  handleAnchorOnClick = (e, link) => {
    e.preventDefault();
    this.updateUrlRoute(link.href);
  };

  handleAnchorOnChange = (currentActiveLink) => {
    if (
      (this.props.history.action === "POP" &&
        currentActiveLink === this.props.history.location.hash) ||
      this.props.match.params.tab !== this.props.tabSection
    ) {
      return;
    }

    this.props.history.replace(this.urlRoute, { currentActiveLink });
  };

  updateUrlRoute = (route) => {
    const { projectGuid } = this.props.match.params;
    this.urlRoute = routes.PROJECT_ALL_DOCUMENTS.hashRoute(projectGuid, route);

    if (route === this.props.history.location.hash) {
      return;
    }

    this.props.history.push(this.urlRoute, { currentActiveLink: route });
  };

  render() {
    return (
      <div>
        <Anchor
          affix={false}
          offsetTop={160}
          onChange={this.handleAnchorOnChange}
          onClick={this.handleAnchorOnClick}
          ref={(anchor) => {
            this.anchor = anchor;
          }}
        >
          {this.sideMenuOptions.map(({ href, title }) => (
            <Anchor.Link key={title} href={`#${href}`} title={title} className="now-menu-link" />
          ))}
        </Anchor>
      </div>
    );
  }
}

ProjectDocumentsTabSideMenu.propTypes = propTypes;
ProjectDocumentsTabSideMenu.defaultProps = defaultProps;

export default withRouter(ProjectDocumentsTabSideMenu);
