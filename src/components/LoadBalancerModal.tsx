import React, { useState, useEffect } from 'react';
import { 
  loadBalancer, 
  ClusterNode, 
  ClusterMetrics, 
  LoadBalancerTransactionLog, 
  LoadBalanceAlgorithm 
} from '../services/loadBalancer';
import { errorHandler, AppErrorRecord } from '../services/errorHandler';
import { 
  Server, 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  RotateCcw, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  Power, 
  CheckCircle2, 
  ArrowRightLeft, 
  Clock, 
  Terminal,
  Bug,
  RefreshCw,
  Gauge
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadBalancerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [nodes, setNodes] = useState<ClusterNode[]>(loadBalancer.getNodes());
  const [metrics, setMetrics] = useState<ClusterMetrics>(loadBalancer.getMetrics());
  const [logs, setLogs] = useState<LoadBalancerTransactionLog[]>(loadBalancer.getLogs());
  const [errorLogs, setErrorLogs] = useState<AppErrorRecord[]>(errorHandler.getErrorLogs());
  const [activeTab, setActiveTab] = useState<'nodes' | 'traffic-logs' | 'error-logs'>('nodes');
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);
  const [spikeResult, setSpikeResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to Load Balancer live state
    const unsubscribeLb = loadBalancer.subscribe((updatedNodes, updatedMetrics, updatedLogs) => {
      setNodes(updatedNodes);
      setMetrics(updatedMetrics);
      setLogs(updatedLogs);
    });

    // Subscribe to Error Handler logs
    const unsubscribeErr = errorHandler.subscribe((errs) => {
      setErrorLogs(errs);
    });

    return () => {
      unsubscribeLb();
      unsubscribeErr();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAlgorithmChange = (algo: LoadBalanceAlgorithm) => {
    loadBalancer.setAlgorithm(algo);
  };

  const handleToggleNode = (nodeId: string) => {
    loadBalancer.toggleNodeHealth(nodeId);
  };

  const handleSimulateSpike = async () => {
    setIsSimulatingSpike(true);
    setSpikeResult(null);
    try {
      const res = await loadBalancer.simulateTrafficSpike(40);
      setSpikeResult(`লোড স্পাইক সফল: ৪০টি রিকোয়েস্ট সফলভাবে নোডগুলোতে ব্যালেন্স করা হয়েছে (গড় লেটেন্সি: ${res.avgLatency}ms, ফেইলওভার: ${res.failovers})`);
    } finally {
      setIsSimulatingSpike(false);
    }
  };

  const handleTriggerTestError = () => {
    errorHandler.triggerTestError('ব্যবহারকারী দ্বারা নিয়ন্ত্রিত ডায়াগনস্টিক এরর ট্রিগার করা হয়েছে।');
    setActiveTab('error-logs');
  };

  const handleResetCluster = () => {
    loadBalancer.resetStats();
    setSpikeResult('ক্লাস্টার পরিসংখ্যান স্বাভাবিক মানে রিসেট করা হয়েছে।');
  };

  const healthyCount = nodes.filter((n) => n.status === 'healthy').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  High-Availability Cluster
                </span>
                <span className="text-xs text-slate-400">সাভার পৌরসভা ও আশুলিয়া করিডোর</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                মাল্টি-নোড ক্লাস্টার লোড ব্যালেন্সার ও এরর ডায়াগনস্টিক
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Cluster Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">ক্লাস্টার অবস্থা</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${healthyCount > 2 ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
                {healthyCount}/৪ নোড সচল
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">গড় লেটেন্সি</span>
              <span className="text-xs sm:text-sm font-bold text-blue-300 font-mono">
                {metrics.averageLatencyMs} ms (অতি দ্রুত)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">প্রসেসকৃত রিকোয়েস্ট</span>
              <span className="text-xs sm:text-sm font-bold text-teal-300 font-mono">
                {metrics.totalRequests.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">ফেইলওভার হ্যান্ডলিং</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">
                {metrics.failoverEvents} টি ইভেন্ট
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Chooser & Simulator Bar */}
        <div className="p-4 sm:px-6 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>ব্যালেন্সিং অ্যালগরিদম:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'least-connections', label: 'Least Connections (সর্বনিম্ন সংযোগ - প্রস্তাবিত)' },
                { id: 'round-robin', label: 'Round Robin (পর্যায়ক্রমিক)' },
                { id: 'geo-proximity', label: 'Geo-Proximity (সাভার/বাইপাইল/আশুলিয়া)' },
                { id: 'lowest-latency', label: 'Lowest Latency (দ্রুততম রেসপন্স)' },
              ].map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => handleAlgorithmChange(algo.id as LoadBalanceAlgorithm)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    metrics.activeAlgorithm === algo.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test & Stress Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateSpike}
              disabled={isSimulatingSpike}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              title="৪০টি নাগরিক অভিযোগ লোড স্পাইক পাঠিয়ে ট্রাফিক ব্যালেন্সিং পরীক্ষা করুন"
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulatingSpike ? 'animate-spin' : ''}`} />
              <span>{isSimulatingSpike ? 'স্পাইক চলছে...' : '৪০টি লোড স্পাইক পরীক্ষা'}</span>
            </button>

            <button
              onClick={handleTriggerTestError}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="সিস্টেমে এরর হ্যান্ডলার যাচাইকরণ টেস্ট করুন"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>এরর হ্যান্ডলার টেস্ট</span>
            </button>

            <button
              onClick={handleResetCluster}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="রিসেট"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {spikeResult && (
          <div className="px-4 sm:px-6 py-2 bg-emerald-950/50 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{spikeResult}</span>
            </div>
            <button onClick={() => setSpikeResult(null)} className="text-emerald-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 px-4 sm:px-6 pt-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'nodes'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>সক্রিয় ক্লাস্টার নোডস ({nodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('traffic-logs')}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'traffic-logs'
                ? 'border-emerald-400 text-emerald-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>লাইভ ট্রাফিক ও রিকোয়েস্ট লগ ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('error-logs')}
            className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'error-logs'
                ? 'border-rose-400 text-rose-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>এরর হ্যান্ডলার ডায়াগনস্টিক লগ ({errorLogs.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 grow">
          
          {/* TAB 1: NODES DISPLAY */}
          {activeTab === 'nodes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node) => {
                const isOnline = node.status === 'healthy';
                return (
                  <div
                    key={node.id}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                      isOnline
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-rose-950/20 border-rose-900/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isOnline ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-rose-500'
                            }`}
                          />
                          <h4 className="font-bold text-sm text-white">{node.nameBn}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">{node.region}</p>
                        <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">{node.host}</span>
                      </div>

                      <button
                        onClick={() => handleToggleNode(node.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
                          isOnline
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                        }`}
                        title={isOnline ? 'নোড অফলাইন করে ফেইলওভার টেস্ট করুন' : 'নোড সক্রিয় করুন'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isOnline ? 'অফলাইন করুন' : 'অনলাইন করুন'}</span>
                      </button>
                    </div>

                    {/* Node Telemetry Bars */}
                    <div className="space-y-2.5 text-xs">
                      {/* CPU */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-teal-400" />
                            <span>CPU লোড:</span>
                          </span>
                          <span className="font-mono text-slate-200">{isOnline ? `${node.cpuUsagePercent}%` : '0%'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              node.cpuUsagePercent > 70 ? 'bg-rose-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${isOnline ? node.cpuUsagePercent : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Memory */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                            <span>RAM ব্যবহার:</span>
                          </span>
                          <span className="font-mono text-slate-200">{isOnline ? `${node.memoryUsagePercent}%` : '0%'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${isOnline ? node.memoryUsagePercent : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Node Stats */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <div>
                          <span>সংযোগ: </span>
                          <strong className="text-white">{isOnline ? node.activeConnections : 0}</strong>
                        </div>
                        <div>
                          <span>মোট হ্যান্ডেল্ড: </span>
                          <strong className="text-emerald-400">{node.totalRequestsHandled}</strong>
                        </div>
                        <div>
                          <span>পিং: </span>
                          <strong className="text-teal-300">{isOnline ? `${node.currentLatencyMs}ms` : '--'}</strong>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: LIVE TRAFFIC LOGS */}
          {activeTab === 'traffic-logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>লোড ব্যালেন্সার দ্বারা প্রক্রিয়াকৃত সাম্প্রতিক রিকোয়েস্ট লগ:</span>
                <span className="text-[11px] font-mono">সর্বশেষ ৫০টি লেনদেন সংরক্ষিত</span>
              </div>
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">ট্রানজেকশন ID</th>
                      <th className="p-3">সময়</th>
                      <th className="p-3">অ্যাকশন</th>
                      <th className="p-3">রাউটেড ক্লাস্টার নোড</th>
                      <th className="p-3">লেটেন্সি</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300 font-mono text-[11px]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-emerald-400 font-semibold">{log.id}</td>
                        <td className="p-3 text-slate-400">{log.timestamp}</td>
                        <td className="p-3 font-sans text-slate-200">{log.action}</td>
                        <td className="p-3 text-teal-300">{log.routedNodeName}</td>
                        <td className="p-3 text-slate-300">{log.latencyMs} ms</td>
                        <td className="p-3">
                          {log.status === 'success' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                              200 OK
                            </span>
                          ) : log.status === 'failover_success' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                              Failover Routed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                              Handled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ERROR HANDLER DIAGNOSTICS */}
          {activeTab === 'error-logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>সিস্টেম এরর হ্যান্ডলার দ্বারা ক্যাপচারকৃত বার্তা ও সতর্কবার্তা:</span>
                <button
                  onClick={() => errorHandler.clearLogs()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                >
                  লগ পরিষ্কার করুন
                </button>
              </div>

              {errorLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">কোনো ত্রুটি বা সতর্কবার্তা নেই</p>
                  <p className="text-[11px] text-slate-500 mt-1">সিস্টেম সম্পূর্ণ ত্রুটিমুক্ত ও স্থিতিশীল রয়েছে।</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {errorLogs.map((err) => (
                    <div
                      key={err.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            err.severity === 'critical' || err.severity === 'error'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {err.severity}
                          </span>
                          <span className="text-slate-400 font-bold">{err.id}</span>
                          <span className="text-slate-500 text-[10px]">({err.context})</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-200 font-sans text-xs">{err.message}</p>
                      {err.stack && (
                        <pre className="text-[10px] text-slate-500 whitespace-pre-wrap bg-slate-900 p-2 rounded-lg max-h-24 overflow-y-auto">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>সাভার পৌরসভা ডিজিটাল সেন্ট্রাল ক্লাস্টার গেটওয়ে সক্রিয়</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
