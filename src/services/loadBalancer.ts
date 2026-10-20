// Multi-Node Cluster Load Balancer & High Availability Service for Savar Service Hub
import { errorHandler } from './errorHandler';

export type LoadBalanceAlgorithm = 'round-robin' | 'least-connections' | 'geo-proximity' | 'lowest-latency';

export type NodeHealthStatus = 'healthy' | 'high_load' | 'degraded' | 'offline';

export interface ClusterNode {
  id: string;
  nameBn: string;
  nameEn: string;
  host: string;
  region: string;
  status: NodeHealthStatus;
  activeConnections: number;
  totalRequestsHandled: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  baseLatencyMs: number;
  currentLatencyMs: number;
  weight: number;
  maxRps: number;
  failureCount: number;
  lastHealthCheck: string;
}

export interface LoadBalancerTransactionLog {
  id: string;
  timestamp: string;
  action: string;
  routedNodeId: string;
  routedNodeName: string;
  algorithmUsed: LoadBalanceAlgorithm;
  latencyMs: number;
  status: 'success' | 'failover_success' | 'throttled' | 'failed';
  locationContext?: string;
  priority?: 'normal' | 'emergency';
}

export interface ClusterMetrics {
  totalRequests: number;
  successfulRequests: number;
  failoverEvents: number;
  averageLatencyMs: number;
  activeAlgorithm: LoadBalanceAlgorithm;
  overallHealth: 'optimal' | 'stable' | 'degraded' | 'critical';
  uptimeSeconds: number;
}

type LoadBalancerListener = (nodes: ClusterNode[], metrics: ClusterMetrics, logs: LoadBalancerTransactionLog[]) => void;

class LoadBalancerService {
  private nodes: ClusterNode[] = [
    {
      id: 'node-savar-central',
      nameBn: 'সাভার সেন্ট্রাল কোর নোড (পৌরসভা ভবন)',
      nameEn: 'Savar Central Core (Municipality Bhaban)',
      host: 'cluster-savar-01.savar.gov.bd',
      region: 'সাভার পৌরসভা (ওয়ার্ড ১ - ৯)',
      status: 'healthy',
      activeConnections: 3,
      totalRequestsHandled: 1240,
      cpuUsagePercent: 32,
      memoryUsagePercent: 41,
      baseLatencyMs: 14,
      currentLatencyMs: 15,
      weight: 1.0,
      maxRps: 300,
      failureCount: 0,
      lastHealthCheck: new Date().toISOString(),
    },
    {
      id: 'node-baipail-edge',
      nameBn: 'বাইপাইল ও ডিইপিজেড এজ গেটওয়ে',
      nameEn: 'Baipayl & DEPZ Industrial Edge Gateway',
      host: 'edge-baipail-02.savar.gov.bd',
      region: 'বাইপাইল মোড়, ডিইপিজেড ও পল্লীবিদ্যুৎ',
      status: 'healthy',
      activeConnections: 4,
      totalRequestsHandled: 980,
      cpuUsagePercent: 38,
      memoryUsagePercent: 45,
      baseLatencyMs: 18,
      currentLatencyMs: 19,
      weight: 1.0,
      maxRps: 250,
      failureCount: 0,
      lastHealthCheck: new Date().toISOString(),
    },
    {
      id: 'node-ashulia-gw',
      nameBn: 'আশুলিয়া মডেল জোন ক্লাস্টার নোড',
      nameEn: 'Ashulia Model Zone Cluster Node',
      host: 'edge-ashulia-03.savar.gov.bd',
      region: 'আশুলিয়া, জামগড়া, জিরাবো ও বিকেএসপি',
      status: 'healthy',
      activeConnections: 2,
      totalRequestsHandled: 860,
      cpuUsagePercent: 29,
      memoryUsagePercent: 37,
      baseLatencyMs: 20,
      currentLatencyMs: 21,
      weight: 0.9,
      maxRps: 220,
      failureCount: 0,
      lastHealthCheck: new Date().toISOString(),
    },
    {
      id: 'node-dr-backup',
      nameBn: 'দুর্যোগকালীন রিডান্ড্যান্ট ব্যাকআপ ক্লাস্টার (DR)',
      nameEn: 'Disaster Recovery (DR) Redundant Replica',
      host: 'backup-dr-04.savar.gov.bd',
      region: 'গ্রেটার সাভার ইমার্জেন্সি ফলব্যাক',
      status: 'healthy',
      activeConnections: 1,
      totalRequestsHandled: 420,
      cpuUsagePercent: 18,
      memoryUsagePercent: 24,
      baseLatencyMs: 24,
      currentLatencyMs: 24,
      weight: 0.8,
      maxRps: 400,
      failureCount: 0,
      lastHealthCheck: new Date().toISOString(),
    },
  ];

  private algorithm: LoadBalanceAlgorithm = 'least-connections';
  private roundRobinIndex = 0;
  private transactionLogs: LoadBalancerTransactionLog[] = [];
  private listeners: Set<LoadBalancerListener> = new Set();
  private totalRequests = 3500;
  private successfulRequests = 3488;
  private failoverEvents = 12;
  private startTime = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startHeartbeatMonitor();
    this.seedInitialLogs();
  }

  private seedInitialLogs() {
    const actions = [
      'নাগরিক অভিযোগ ডাটা সিঙ্ক',
      'বাইপাইল ট্রাফিক ওয়াটারলগিং রিপোর্ট',
      'সাভার বাজার রোড সংস্কার স্ট্যাটাস কোয়েরি',
      'জরুরি ফায়ার সার্ভিস ডিরেক্টরি রিকোয়েস্ট',
    ];
    for (let i = 0; i < 4; i++) {
      const node = this.nodes[i % this.nodes.length];
      this.transactionLogs.push({
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date(Date.now() - (4 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: actions[i],
        routedNodeId: node.id,
        routedNodeName: node.nameBn,
        algorithmUsed: this.algorithm,
        latencyMs: node.baseLatencyMs + Math.floor(Math.random() * 6),
        status: 'success',
      });
    }
  }

  /**
   * Dispatches a citizen request through the active load balancing algorithm
   * Automatically handles node selection, health checks, failover, and metrics.
   */
  public async dispatchRequest<T>(params: {
    action: string;
    locationContext?: string;
    priority?: 'normal' | 'emergency';
    executeTask?: () => Promise<T> | T;
  }): Promise<{ result?: T; node: ClusterNode; latencyMs: number; status: LoadBalancerTransactionLog['status'] }> {
    this.totalRequests++;

    // Select target node based on current algorithm
    let selectedNode = this.selectNode(params.locationContext, params.priority);
    let status: LoadBalancerTransactionLog['status'] = 'success';

    // If node is offline or degraded, trigger seamless failover
    if (selectedNode.status === 'offline') {
      this.failoverEvents++;
      const healthyNodes = this.nodes.filter((n) => n.status !== 'offline');
      if (healthyNodes.length > 0) {
        // Fallback to node with least connections or DR node
        selectedNode = healthyNodes.reduce((min, cur) => (cur.activeConnections < min.activeConnections ? cur : min));
        status = 'failover_success';
      } else {
        // Complete outage protection - activate DR emergency mode
        selectedNode.status = 'healthy';
        status = 'failover_success';
      }
    }

    // Update node load
    selectedNode.activeConnections++;
    selectedNode.totalRequestsHandled++;

    const latency = selectedNode.baseLatencyMs + Math.floor(Math.random() * 8) + (params.priority === 'emergency' ? 0 : 2);
    selectedNode.currentLatencyMs = latency;

    // Simulate asynchronous round-trip network execution through load balanced cluster
    let taskResult: T | undefined;
    try {
      if (params.executeTask) {
        taskResult = await params.executeTask();
      }
      this.successfulRequests++;
    } catch (err) {
      errorHandler.logError({
        message: `Node ${selectedNode.id} task error: ${err instanceof Error ? err.message : String(err)}`,
        category: 'network',
        severity: 'error',
        context: `LoadBalancer:${params.action}`,
      });
      status = 'failed';
    } finally {
      selectedNode.activeConnections = Math.max(0, selectedNode.activeConnections - 1);
    }

    // Record transaction
    const logEntry: LoadBalancerTransactionLog = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: params.action,
      routedNodeId: selectedNode.id,
      routedNodeName: selectedNode.nameBn,
      algorithmUsed: this.algorithm,
      latencyMs: latency,
      status,
      locationContext: params.locationContext,
      priority: params.priority || 'normal',
    };

    this.transactionLogs = [logEntry, ...this.transactionLogs.slice(0, 49)];
    this.notifySubscribers();

    return {
      result: taskResult,
      node: selectedNode,
      latencyMs: latency,
      status,
    };
  }

  /**
   * Algorithm selector
   */
  private selectNode(locationContext?: string, priority?: 'normal' | 'emergency'): ClusterNode {
    const activeHealthyNodes = this.nodes.filter((n) => n.status !== 'offline');
    const pool = activeHealthyNodes.length > 0 ? activeHealthyNodes : this.nodes;

    // High priority emergency reports route to Savar Central or DR directly
    if (priority === 'emergency') {
      const central = pool.find((n) => n.id === 'node-savar-central');
      if (central && central.status === 'healthy') return central;
    }

    switch (this.algorithm) {
      case 'round-robin': {
        const node = pool[this.roundRobinIndex % pool.length];
        this.roundRobinIndex = (this.roundRobinIndex + 1) % pool.length;
        return node;
      }

      case 'least-connections': {
        return pool.reduce((lowest, current) => {
          return current.activeConnections < lowest.activeConnections ? current : lowest;
        }, pool[0]);
      }

      case 'lowest-latency': {
        return pool.reduce((fastest, current) => {
          return current.currentLatencyMs < fastest.currentLatencyMs ? current : fastest;
        }, pool[0]);
      }

      case 'geo-proximity': {
        const loc = (locationContext || '').toLowerCase();
        if (loc.includes('baipail') || loc.includes('বাইপাইল') || loc.includes('depz')) {
          const baipail = pool.find((n) => n.id === 'node-baipail-edge');
          if (baipail) return baipail;
        } else if (loc.includes('ashulia') || loc.includes('আশুলিয়া') || loc.includes('jamgora') || loc.includes('zirani')) {
          const ashulia = pool.find((n) => n.id === 'node-ashulia-gw');
          if (ashulia) return ashulia;
        } else {
          const savar = pool.find((n) => n.id === 'node-savar-central');
          if (savar) return savar;
        }
        return pool[0];
      }

      default:
        return pool[0];
    }
  }

  /**
   * Simulate a sudden high-load spike across the municipal cluster (e.g., 50 citizen complaints during flash flood)
   */
  public async simulateTrafficSpike(count = 50): Promise<{ dispatched: number; failovers: number; avgLatency: number }> {
    const areas = ['বাইপাইল মোড়', 'সাভার বাজার কোর্ট চত্বর', 'আশুলিয়া জামগড়া', 'ডিইপিজেড সংলগ্ন সড়ক', 'রেডিও কলোনি'];
    let failovers = 0;
    let totalLatency = 0;

    for (let i = 0; i < count; i++) {
      const area = areas[i % areas.length];
      const res = await this.dispatchRequest({
        action: `নাগরিক ট্রাফিক লোড পরীক্ষা #${i + 1}`,
        locationContext: area,
        priority: i % 10 === 0 ? 'emergency' : 'normal',
      });
      if (res.status === 'failover_success') failovers++;
      totalLatency += res.latencyMs;

      // Small jitter between requests
      if (i % 5 === 0) {
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    return {
      dispatched: count,
      failovers,
      avgLatency: Math.round(totalLatency / count),
    };
  }

  /**
   * Manually toggle node health status (for testing failover behavior)
   */
  public toggleNodeHealth(nodeId: string, forcedStatus?: NodeHealthStatus): void {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (forcedStatus) {
      node.status = forcedStatus;
    } else {
      node.status = node.status === 'healthy' ? 'offline' : 'healthy';
    }

    if (node.status === 'offline') {
      node.activeConnections = 0;
      errorHandler.logWarning(
        `ক্লাস্টার নোড অফলাইন: ${node.nameBn} (${node.id}) সাময়িকভাবে ডাউন করা হয়েছে। লোড ব্যালেন্সার ট্রাফিক ফেইলওভার করেছে।`,
        'LoadBalancer:NodeHealth'
      );
    } else {
      node.status = 'healthy';
    }

    this.notifySubscribers();
  }

  /**
   * Change load balancing algorithm
   */
  public setAlgorithm(algo: LoadBalanceAlgorithm): void {
    this.algorithm = algo;
    this.notifySubscribers();
  }

  public getAlgorithm(): LoadBalanceAlgorithm {
    return this.algorithm;
  }

  public getNodes(): ClusterNode[] {
    return this.nodes.map((n) => ({ ...n }));
  }

  public getLogs(): LoadBalancerTransactionLog[] {
    return [...this.transactionLogs];
  }

  public getMetrics(): ClusterMetrics {
    const healthyCount = this.nodes.filter((n) => n.status === 'healthy').length;
    let overallHealth: ClusterMetrics['overallHealth'] = 'optimal';
    if (healthyCount === 4) overallHealth = 'optimal';
    else if (healthyCount >= 2) overallHealth = 'stable';
    else if (healthyCount === 1) overallHealth = 'degraded';
    else overallHealth = 'critical';

    const avgLat = Math.round(
      this.nodes.reduce((acc, cur) => acc + cur.currentLatencyMs, 0) / this.nodes.length
    );

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failoverEvents: this.failoverEvents,
      averageLatencyMs: avgLat,
      activeAlgorithm: this.algorithm,
      overallHealth,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  public resetStats(): void {
    this.totalRequests = 100;
    this.successfulRequests = 100;
    this.failoverEvents = 0;
    this.nodes.forEach((n) => {
      n.status = 'healthy';
      n.activeConnections = 1;
      n.totalRequestsHandled = 25;
      n.cpuUsagePercent = Math.floor(20 + Math.random() * 20);
      n.currentLatencyMs = n.baseLatencyMs;
    });
    this.transactionLogs = [];
    this.seedInitialLogs();
    this.notifySubscribers();
  }

  public subscribe(listener: LoadBalancerListener): () => void {
    this.listeners.add(listener);
    listener(this.getNodes(), this.getMetrics(), this.getLogs());
    return () => this.listeners.delete(listener);
  }

  private notifySubscribers(): void {
    const nodes = this.getNodes();
    const metrics = this.getMetrics();
    const logs = this.getLogs();
    this.listeners.forEach((listener) => {
      try {
        listener(nodes, metrics, logs);
      } catch (err) {
        console.error('Error notifying load balancer listener', err);
      }
    });
  }

  private startHeartbeatMonitor(): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => {
      this.nodes.forEach((n) => {
        if (n.status !== 'offline') {
          // Slight fluctuation in metrics to reflect live servers
          const deltaCpu = (Math.random() - 0.5) * 6;
          n.cpuUsagePercent = Math.max(12, Math.min(88, Math.round(n.cpuUsagePercent + deltaCpu)));
          const deltaLat = (Math.random() - 0.5) * 4;
          n.currentLatencyMs = Math.max(8, Math.round(n.baseLatencyMs + deltaLat));
          n.lastHealthCheck = new Date().toISOString();
        }
      });
      this.notifySubscribers();
    }, 4000);
  }
}

export const loadBalancer = new LoadBalancerService();
