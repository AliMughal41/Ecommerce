import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, startSessionTracking, stopSessionTracking, initGeo } from '../utils/tracking';

export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    initGeo();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    startSessionTracking();
    return () => {
      stopSessionTracking();
    };
  }, []);

  return null;
}
