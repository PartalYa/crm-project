import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
// import location
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { hideLoadingScreen, updateLoadingText, LoadingStates } from '../utils/loadingScreen';

export default function Layout() {
  const layoutStartTime = Date.now();
  console.log('🏗️ Layout component started at:', layoutStartTime);

  // get current hash route
  const location = useLocation();
  const routesNoHeader = ['/create-order', '/create-order/*'];
  const isNoHeader = routesNoHeader.some((route) => {
    if (route.endsWith('/*')) {
      const basePath = route.replace('/*', '');
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === route;
  });

  // Hide loading screen when Layout is mounted and rendered
  useEffect(() => {
    const effectStart = Date.now();
    console.log(
      '⚡ Layout effect started at:',
      effectStart - layoutStartTime,
      'ms after component start',
    );

    // Simulate loading progression
    updateLoadingText(LoadingStates.STARTING);

    const timer = setTimeout(() => {
      updateLoadingText(LoadingStates.READY);
      setTimeout(() => {
        console.log('🎯 About to hide loading screen...');
        hideLoadingScreen();
      }, 200);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  console.log('🏗️ Layout component rendering at:', Date.now() - layoutStartTime, 'ms');

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      {!isNoHeader && <Header />}
      <div className={`px-8 h-full ${!isNoHeader ? 'pb-8' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
