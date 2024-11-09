import React, { FC, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as Strings from "@mds/common/constants/strings";
import queryString from "query-string";
import { fetchProjects } from "@mds/common/redux/actionCreators/projectActionCreator";
import {
  getCommodityOptionHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getProjects, getProjectPageData } from "@mds/common/redux/selectors/projectSelectors";
import * as router from "@/constants/routes";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import MajorProjectSearch from "./MajorProjectSearch";
import MajorProjectTable from "./MajorProjectTable";

interface MajorProjectHomePageProps {
  history: any;
  location: { search: string };
}

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "update_timestamp",
  sort_dir: "desc",
  search: undefined,
  update_timestamp: undefined,
};

export const MajorProjectHomePage: FC<MajorProjectHomePageProps> = ({
  history,
  location,
}) => {

  const dispatch = useDispatch();
  const mineCommodityOptionsHash = useSelector(getCommodityOptionHash);
  const projects = useSelector(getProjects);
  const pageData = useSelector(getProjectPageData);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [listParams, setListParams] = useState(defaultParams);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const previousLocation = useRef(location);

  useEffect(() => {
    const params = queryString.parse(location.search);
    setListParams((prevState) => ({
      ...prevState,
      ...params,
    }));
  }, []);

  useEffect(() => {
    history.replace(router.MAJOR_PROJECTS_DASHBOARD.dynamicRoute(listParams));
  }, [listParams]);

  useEffect(() => {
    if (location !== previousLocation.current) {
      setProjectsLoaded(false);
      renderDataFromURL(location.search);
    }

    previousLocation.current = location;
  }, [location])

  const renderDataFromURL = async (params) => {
    const parsedParams = queryString.parse(params);
    await dispatch(fetchProjects(parsedParams));
    setProjectsLoaded(true);
  };

  const clearParams = () => {
    setListParams((prevState) => ({
      ...defaultParams,
      per_page: prevState.per_page || defaultParams.per_page,
      sort_field: prevState.sort_field,
      sort_dir: prevState.sort_dir,
    }))
  };

  const onPageChange = (page, per_page) => {
    setListParams((prevState) => ({ ...prevState, page, per_page }));
  };

  const handleSearch = (params) => {
    const searchParams = params.updated_date ? { ...params, sort_dir: "asc" } : params;
    setListParams(searchParams);
  };

  const onExpand = (expanded, record) => {
    setExpandedRowKeys((prevState) =>
      expanded ? prevState.concat(record.key) : prevState.filter((key) => key !== record.key)
    );
  }

  return (
    <div className="landing-page">
      <div className="landing-page__header">
        <div className="inline-flex between center-mobile center-mobile">
          <div>
            <h1>Major Projects</h1>
          </div>
        </div>
      </div>
      <div className="landing-page__content">
        <div className="page__content">
          <MajorProjectSearch
            initialValues={listParams}
            handleSearch={handleSearch}
            handleReset={clearParams}
          />
          <MajorProjectTable
            isLoaded={projectsLoaded}
            handleSearch={handleSearch}
            projects={projects}
            sortField={listParams.sort_field}
            sortDir={listParams.sort_dir}
            filters={listParams}
            mineCommodityOptionsHash={mineCommodityOptionsHash}
            expandedRowKeys={expandedRowKeys}
            onExpand={onExpand}
          />
          <div className="center">
            <ResponsivePagination
              onPageChange={onPageChange}
              currentPage={Number(listParams.page)}
              pageTotal={pageData?.total}
              itemsPerPage={Number(listParams.per_page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MajorProjectHomePage;