import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler } from '../services/errorHandler';
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  ServerCrash
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR-REACT-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log fatal rendering exception into centralized error handler
    errorHandler.logError({
      message: error.message || 'React UI Render Crash',
      category: 'render',
      severity: 'critical',
      context: 'React:ErrorBoundary',
      stack: `${error.stack || ''}\nComponent Stack: ${errorInfo.componentStack || ''}`,
    });

    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '';
    // Optional navigation fallback
  };

  private handleResetStorage = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        // Keep user info if possible, only clear potentially corrupted cache
        const keysToRemove = ['savar_service_hub_complaints_v1', 'savar_service_hub_error_logs_v1'];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Safe catch
      }
    }
    window.location.reload();
  };

  private handleCopyDiagnostic = () => {
    const diagnosticText = `--- SAVAR SERVICE HUB DIAGNOSTIC ERROR REPORT ---
Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
------------------------------------------------`;

    navigator.clipboard.writeText(diagnosticText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header with Error Alert Icon */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {this.state.errorId || 'ERR-RELOAD-REQUIRED'}
                  </span>
                  <span className="text-xs text-slate-400">সাভার সার্ভিস হাব এরর হ্যান্ডলার</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  অ্যাপ্লিকেশনে একটি অপ্রত্যাশিত ত্রুটি শনাক্ত হয়েছে
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  An unexpected render exception was safely caught by the application Error Boundary.
                </p>
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-3">
              <span className="text-base">🛡️</span>
              <div>
                <strong className="text-emerald-200 block font-semibold mb-0.5">আপনার ডেটা সম্পূর্ণ নিরাপদ:</strong>
                আপনার পূর্বে সংরক্ষিত অভিযোগ ও সেটিংস সুরক্ষিত আছে। নিচে থাকা বাটনের মাধ্যমে সিস্টেমটি স্বাভাবিক অবস্থায় পুনরায় চালু করতে পারেন।
              </div>
            </div>

            {/* Error Message Summary Box */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300 break-words">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown runtime error occurred.'}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>সিস্টেম রিলোড করুন</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>হোমে ফিরে যান</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="ক্যাশ ডেটা মুছে পুনরায় শুরু করুন"
              >
                <Trash2 className="w-4 h-4" />
                <span>ক্যাশ রিসেট করুন</span>
              </button>
            </div>

            {/* Collapsible Technical Details for Engineers & Support */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1"
                >
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>কারিগরি বিবরণ ও স্ট্যাক ট্রেস (Technical Diagnostic)</span>
                </button>

                <button
                  onClick={this.handleCopyDiagnostic}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-700/40 cursor-pointer transition-colors"
                >
                  {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{this.state.copied ? 'কপি হয়েছে!' : 'রিপোর্ট কপি করুন'}</span>
                </button>
              </div>

              {this.state.showDetails && (
                <div className="mt-3 p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 space-y-2">
                  <div>
                    <span className="text-slate-500">Component Stack:</span>
                    <pre className="text-slate-400 whitespace-pre-wrap mt-1">
                      {this.state.errorInfo?.componentStack || 'No component stack available.'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500">Stack Trace:</span>
                    <pre className="text-rose-400/90 whitespace-pre-wrap mt-1">
                      {this.state.error?.stack || 'No stack trace captured.'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
