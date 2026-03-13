import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = "Processing your book...",
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-background">
        <div className="loading-shadow">
          <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
          <h2 className="loading-title">{title}</h2>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <span className="loading-progress-status"></span>
              <span className="text-sm text-[var(--text-secondary)]">
                Processing book...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
