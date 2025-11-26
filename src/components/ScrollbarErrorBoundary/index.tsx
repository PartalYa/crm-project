import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  libraryName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ScrollbarErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.libraryName || 'scrollbar component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="h-full w-full flex items-center justify-center bg-red-50 border border-red-200 rounded">
            <div className="text-center p-4">
              <div className="text-red-600 font-semibold mb-2">
                {this.props.libraryName || 'Scrollbar'} Error
              </div>
              <div className="text-sm text-red-500">Failed to render scrollbar component</div>
              <div className="text-xs text-gray-500 mt-2">Check console for details</div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ScrollbarErrorBoundary;
