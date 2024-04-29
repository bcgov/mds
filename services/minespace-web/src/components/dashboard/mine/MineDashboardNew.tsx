import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { IMine } from "@mds/common/interfaces";
import { MINE_DASHBOARD } from "@/constants/routes";
import { getMineDashboardRoutes } from "./MineDashboardRoutes";
import SidebarWrapper from "@mds/common/components/common/SidebarWrapper";
import Loading from "@/components/common/Loading";

const MineDashboardNew = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const defaultIsLoadedValue: boolean = mine?.mine_guid === id;
  const [isLoaded, setIsLoaded] = useState(defaultIsLoadedValue);

  useEffect(() => {
    if (!mine || mine.mine_guid !== id) {
      setIsLoaded(false);
      dispatch(fetchMineRecordById(id)).then(() => {
        setIsLoaded(true);
      });
    }
  }, [id]);

  const dynamicRoute = (key: string) => {
    return MINE_DASHBOARD.dynamicRoute(mine?.mine_guid, key);
  };
  const items = getMineDashboardRoutes(mine?.major_mine_ind).map((item) => ({
    ...item,
    path: dynamicRoute(item.key),
  }));
  const sharedData = { mine };
  return isLoaded ? <SidebarWrapper items={items} sharedData={sharedData} /> : <Loading />;
};

export interface MineDashboardContext {
  mine: IMine;
}

export default MineDashboardNew;
