import React, { Component } from 'react';
import '../styles/glassmorphism.css';
import '../styles/components.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Premium Error Fallback UI
      return (
        <div className="error-page-container">
          <div className="glass-card error-page-card">
            <h1 className="error-page-title">Something went wrong</h1>
            <p className="error-page-message">
              We've encountered an unexpected error. Don't worry, your data is safe, but we need to restart the application.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="error-page-pre">
                {this.state.error && this.state.error.toString()}
              </pre>
            )}
            <button 
              onClick={this.handleReload}
              className="btn-orange error-page-button"
            >
              Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
