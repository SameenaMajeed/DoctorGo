import React from "react";

interface VideoErrorBoundaryProps {
  children: React.ReactNode;
}

export class VideoErrorBoundary extends React.Component <VideoErrorBoundaryProps>{
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Video component error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="video-fallback">Video unavailable</div>;
    }
    return this.props.children;
  }
}
