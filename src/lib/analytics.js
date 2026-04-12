import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Basic Analytics Tracker
 * Can be hooked into Google Analytics, Mixpanel, or PostHog later.
 */
export const trackEvent = (eventName, properties = {}) => {
  // Replace with real analytics tool (e.g. mixpanel.track, gtag('event'))
  console.log(`[ANALYTICS EVENT] ${eventName}`, properties);
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', { path: location.pathname, search: location.search });
  }, [location]);
};
