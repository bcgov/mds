import React from "react";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ENVIRONMENT } from "../constants/environment";

export const trackEvent = (category, action) => {
  const { trackEvent } = useMatomo();
  trackEvent({ category, action });
};

const trackPageView = (title) => {
  const { trackPageView } = useMatomo();

  React.useEffect(() => {
    trackPageView({
      documentTitle: title,
    });
  }, []);
};

export const PageTracker = (props) => {
  trackPageView(props.title);
  return null;
};

export const MatomoLinkTracing = () => {
  const { enableLinkTracking } = useMatomo();

  enableLinkTracking();
  return null;
};
