import { useEffect, useState } from 'react';
import { AppRoute, defaultRoute, getRouteByPath } from './routes';

const normalizePath = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

export const useAppRoute = () => {
  const [route, setRoute] = useState<AppRoute>(() =>
    getRouteByPath(normalizePath(window.location.pathname))
  );

  useEffect(() => {
    const handleNavigation = () => {
      setRoute(getRouteByPath(normalizePath(window.location.pathname)));
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigate = (path: string) => {
    const nextRoute = getRouteByPath(normalizePath(path));
    window.history.pushState({}, '', nextRoute.path);
    setRoute(nextRoute);
  };

  return {
    route: route ?? defaultRoute,
    navigate,
  };
};
