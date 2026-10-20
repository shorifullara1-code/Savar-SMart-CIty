// Error Handler & Diagnostic Service for Savar Service Hub
export interface AppErrorRecord {
  id: string;
  timestamp: string;
  message: string;
  category: 'runtime' | 'network' | 'unhandled_promise' | 'user_action' | 'render' | 'validation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  context?: string;
  stack?: string;
  resolved?: boolean;
}

type ErrorListener = (errors: AppErrorRecord[]) => void;

class ErrorHandlerService {
  private errorLogs: AppErrorRecord[] = [];
  private listeners: Set<ErrorListener> = new Set();
  private isInitialized = false;
  private readonly MAX_LOGS = 50;
  private readonly STORAGE_KEY = 'savar_service_hub_error_logs_v1';

  constructor() {
    this.loadPersistedLogs();
  }

  /**
   * Initializes global error listeners for uncaught errors and promise rejections
   */
  public initGlobalListeners(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Window Error Listener (JavaScript runtime errors)
    window.addEventListener('error', (event: ErrorEvent) => {
      // Ignore normal resize observer loop warnings
      if (event.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
        return;
      }

      this.logError({
        message: event.message || 'Unknown runtime error occurred',
        category: 'runtime',
        severity: 'error',
        context: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : 'window.onerror',
        stack: event.error?.stack,
      });
    });

    // Unhandled Promise Rejection Listener
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      let message = 'Unhandled Promise rejection';
      let stack = '';

      if (event.reason instanceof Error) {
        message = event.reason.message;
        stack = event.reason.stack || '';
      } else if (typeof event.reason === 'string') {
        message = event.reason;
      }

      this.logError({
        message: `Promise Error: ${message}`,
        category: 'unhandled_promise',
        severity: 'warning',
        context: 'window.onunhandledrejection',
        stack,
      });
    });

    this.isInitialized = true;
    console.info('[Savar Error Handler] Global uncaught exception and promise rejection listeners active.');
  }

  /**
   * Logs a new error into the in-memory buffer and updates subscribers
   */
  public logError(params: {
    message: string;
    category?: AppErrorRecord['category'];
    severity?: AppErrorRecord['severity'];
    context?: string;
    stack?: string;
  }): AppErrorRecord {
    const errorRecord: AppErrorRecord = {
      id: `ERR-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      message: params.message || 'Unspecified application error',
      category: params.category || 'runtime',
      severity: params.severity || 'error',
      context: params.context || 'Application',
      stack: params.stack,
      resolved: false,
    };

    // Prepend new error
    this.errorLogs = [errorRecord, ...this.errorLogs.slice(0, this.MAX_LOGS - 1)];
    this.persistLogs();
    this.notifyListeners();

    // Log to console in development
    if (params.severity === 'critical' || params.severity === 'error') {
      console.error(`[Savar ErrorHandler ${errorRecord.id}]`, params.message, params.context || '');
    } else {
      console.warn(`[Savar ErrorHandler ${errorRecord.id}]`, params.message);
    }

    return errorRecord;
  }

  /**
   * Log non-fatal warning
   */
  public logWarning(message: string, context?: string): AppErrorRecord {
    return this.logError({
      message,
      category: 'runtime',
      severity: 'warning',
      context,
    });
  }

  /**
   * Trigger a controlled error for verification and demonstration purposes
   */
  public triggerTestError(customMessage?: string): AppErrorRecord {
    return this.logError({
      message: customMessage || 'পরীক্ষামূলক সিস্টেম ত্রুটি: এরর হ্যান্ডলার যাচাইকরণ সফল (Test Diagnostics Error Triggered)',
      category: 'validation',
      severity: 'warning',
      context: 'Diagnostic Tool / User Testing',
      stack: new Error('Simulated Stack Trace for Savar Service Hub Diagnostics').stack,
    });
  }

  /**
   * Retrieve all logged errors
   */
  public getErrorLogs(): AppErrorRecord[] {
    return [...this.errorLogs];
  }

  /**
   * Clear all error logs
   */
  public clearLogs(): void {
    this.errorLogs = [];
    this.persistLogs();
    this.notifyListeners();
  }

  /**
   * Subscribe to new errors
   */
  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    listener([...this.errorLogs]);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const current = [...this.errorLogs];
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error notifying error listener', err);
      }
    });
  }

  private persistLogs(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errorLogs.slice(0, 30)));
    } catch {
      // Handle storage quota exceeded
    }
  }

  private loadPersistedLogs(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.errorLogs = JSON.parse(data);
      }
    } catch {
      this.errorLogs = [];
    }
  }
}

export const errorHandler = new ErrorHandlerService();
