import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  handleReset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-xl font-bold text-[#173b63] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4 text-sm max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button onClick={this.handleReset} className="btn btn-primary">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
