// src/components/common/ErrorBoundary.jsx

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";
import Logo from "./Logo";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6">
          <Logo size="large" />

          <div className="mt-8 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-dark-400 mb-8">
              We're sorry, but something unexpected happened. Please try again.
            </p>

            <Button
              onClick={this.handleRetry}
              leftIcon={<RefreshCw className="w-5 h-5" />}
            >
              Try Again
            </Button>
          </div>

          {/* Error details (development only) */}
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 p-4 bg-dark-800 rounded-lg max-w-lg w-full">
              <p className="text-sm text-red-400 font-mono break-all">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
