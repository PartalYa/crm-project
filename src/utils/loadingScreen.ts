/**
 * Utility functions for managing the loading screen
 */

const appStartTime = Date.now();

export const hideLoadingScreen = () => {
  console.log('⏱️ hideLoadingScreen called at:', Date.now() - appStartTime, 'ms');

  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && !loadingScreen.classList.contains('loading-fade-out')) {
    console.log('⏱️ Found loading screen element, hiding...');
    const hideStart = Date.now();

    loadingScreen.classList.add('loading-fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      document.body.classList.add('react-loaded');
      console.log('⏱️ Loading screen hidden in:', Date.now() - hideStart, 'ms');
      console.log('🎉 Total app load time:', Date.now() - appStartTime, 'ms');
    }, 500); // Wait for fade out animation
  } else {
    console.log('⚠️ Loading screen element not found or already hidden');
  }
};

export const showLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.remove('loading-fade-out');
    document.body.classList.remove('react-loaded');
  }
};

export const updateLoadingText = (text: string) => {
  console.log('📝 Updating loading text to:', text, 'at:', Date.now() - appStartTime, 'ms');

  const loadingSubtitle = document.getElementById('loading-subtitle');
  if (loadingSubtitle) {
    loadingSubtitle.textContent = text;
  }
};

// Loading states for different parts of the app initialization
export const LoadingStates = {
  INITIALIZING: 'Initializing...',
  LOADING_CONFIG: 'Loading configuration...',
  LOADING_DATA: 'Loading data...',
  STARTING: 'Starting application...',
  READY: 'Ready!',
} as const;
