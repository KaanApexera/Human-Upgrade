import { storage } from "./storage";
import type { WearableProvider, WearableDailyMetrics, InsertWearableDailyMetrics } from "@shared/schema";

const OURA_CLIENT_ID = process.env.OURA_CLIENT_ID;
const OURA_CLIENT_SECRET = process.env.OURA_CLIENT_SECRET;
const OURA_REDIRECT_URI = process.env.OURA_REDIRECT_URI || `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/integrations/oura/callback`;

const WHOOP_CLIENT_ID = process.env.WHOOP_CLIENT_ID;
const WHOOP_CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
const WHOOP_REDIRECT_URI = process.env.WHOOP_REDIRECT_URI || `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/integrations/whoop/callback`;

export function getOuraAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: OURA_CLIENT_ID || '',
    redirect_uri: OURA_REDIRECT_URI,
    response_type: 'code',
    scope: 'daily sleep workout heart_rate',
    state,
  });
  return `https://cloud.ouraring.com/oauth/authorize?${params.toString()}`;
}

export function getWhoopAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: WHOOP_CLIENT_ID || '',
    redirect_uri: WHOOP_REDIRECT_URI,
    response_type: 'code',
    scope: 'read:recovery read:sleep read:workout read:cycles read:profile',
    state,
  });
  return `https://api.prod.whoop.com/oauth/oauth2/auth?${params.toString()}`;
}

export async function exchangeOuraCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: OURA_CLIENT_ID || '',
      client_secret: OURA_CLIENT_SECRET || '',
      redirect_uri: OURA_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error(`Oura token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function exchangeWhoopCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: WHOOP_CLIENT_ID || '',
      client_secret: WHOOP_CLIENT_SECRET || '',
      redirect_uri: WHOOP_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error(`WHOOP token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function refreshOuraToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://api.ouraring.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: OURA_CLIENT_ID || '',
      client_secret: OURA_CLIENT_SECRET || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`Oura token refresh failed: ${response.statusText}`);
  }

  return response.json();
}

export async function refreshWhoopToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: WHOOP_CLIENT_ID || '',
      client_secret: WHOOP_CLIENT_SECRET || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`WHOOP token refresh failed: ${response.statusText}`);
  }

  return response.json();
}

interface OuraSleepData {
  data: {
    day: string;
    score: number;
    total_sleep_duration: number;
    average_hrv: number;
    average_heart_rate: number;
  }[];
}

interface OuraActivityData {
  data: {
    day: string;
    score: number;
    steps: number;
    total_calories: number;
  }[];
}

interface OuraReadinessData {
  data: {
    day: string;
    score: number;
  }[];
}

export async function syncOuraData(userId: string, accessToken: string, startDate: string, endDate: string): Promise<number> {
  const syncLog = await storage.createWearableSyncLog({
    userId,
    provider: 'oura',
    status: 'pending',
  });

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    const [sleepRes, activityRes, readinessRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${endDate}`, { headers }),
    ]);

    const sleepData: OuraSleepData = await sleepRes.json();
    const activityData: OuraActivityData = await activityRes.json();
    const readinessData: OuraReadinessData = await readinessRes.json();

    const dateMap = new Map<string, Partial<InsertWearableDailyMetrics>>();

    for (const sleep of sleepData.data || []) {
      dateMap.set(sleep.day, {
        sleepScore: sleep.score,
        sleepDurationMinutes: Math.round(sleep.total_sleep_duration / 60),
        hrvMs: sleep.average_hrv?.toString(),
        restingHr: sleep.average_heart_rate?.toString(),
      });
    }

    for (const activity of activityData.data || []) {
      const existing = dateMap.get(activity.day) || {};
      dateMap.set(activity.day, {
        ...existing,
        activityScore: activity.score,
        steps: activity.steps,
        calories: activity.total_calories?.toString(),
      });
    }

    for (const readiness of readinessData.data || []) {
      const existing = dateMap.get(readiness.day) || {};
      dateMap.set(readiness.day, {
        ...existing,
        readinessScore: readiness.score,
      });
    }

    let recordsProcessed = 0;
    for (const [day, metrics] of Array.from(dateMap.entries())) {
      await storage.upsertWearableDailyMetrics({
        userId,
        provider: 'oura',
        date: new Date(day),
        ...metrics,
        rawPayload: { sleep: sleepData, activity: activityData, readiness: readinessData },
      } as InsertWearableDailyMetrics);
      recordsProcessed++;
    }

    await storage.updateWearableSyncLog(syncLog.id, {
      status: 'success',
      syncFinishedAt: new Date(),
      recordsProcessed,
    });

    const connection = await storage.getWearableConnection(userId, 'oura');
    if (connection) {
      await storage.updateWearableConnection(connection.id, { lastSyncedAt: new Date() });
    }

    return recordsProcessed;
  } catch (error) {
    await storage.updateWearableSyncLog(syncLog.id, {
      status: 'error',
      syncFinishedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

interface WhoopRecoveryData {
  records: {
    created_at: string;
    score: {
      recovery_score: number;
      hrv_rmssd_milli: number;
      resting_heart_rate: number;
    };
  }[];
}

interface WhoopSleepData {
  records: {
    created_at: string;
    score: {
      sleep_performance_percentage: number;
      total_sleep_time_milli: number;
    };
  }[];
}

interface WhoopCycleData {
  records: {
    created_at: string;
    score: {
      strain: number;
      kilojoules: number;
    };
  }[];
}

export async function syncWhoopData(userId: string, accessToken: string, startDate: string, endDate: string): Promise<number> {
  const syncLog = await storage.createWearableSyncLog({
    userId,
    provider: 'whoop',
    status: 'pending',
  });

  try {
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
      fetch(`https://api.prod.whoop.com/developer/v1/recovery?start=${startDate}&end=${endDate}`, { headers }),
      fetch(`https://api.prod.whoop.com/developer/v1/activity/sleep?start=${startDate}&end=${endDate}`, { headers }),
      fetch(`https://api.prod.whoop.com/developer/v1/cycle?start=${startDate}&end=${endDate}`, { headers }),
    ]);

    const recoveryData: WhoopRecoveryData = await recoveryRes.json();
    const sleepData: WhoopSleepData = await sleepRes.json();
    const cycleData: WhoopCycleData = await cycleRes.json();

    const dateMap = new Map<string, Partial<InsertWearableDailyMetrics>>();

    for (const recovery of recoveryData.records || []) {
      const day = recovery.created_at.split('T')[0];
      dateMap.set(day, {
        recoveryScore: recovery.score.recovery_score,
        hrvMs: recovery.score.hrv_rmssd_milli?.toString(),
        restingHr: recovery.score.resting_heart_rate?.toString(),
      });
    }

    for (const sleep of sleepData.records || []) {
      const day = sleep.created_at.split('T')[0];
      const existing = dateMap.get(day) || {};
      dateMap.set(day, {
        ...existing,
        sleepScore: sleep.score.sleep_performance_percentage,
        sleepDurationMinutes: Math.round(sleep.score.total_sleep_time_milli / 60000),
      });
    }

    for (const cycle of cycleData.records || []) {
      const day = cycle.created_at.split('T')[0];
      const existing = dateMap.get(day) || {};
      dateMap.set(day, {
        ...existing,
        strain: cycle.score.strain?.toString(),
        calories: (cycle.score.kilojoules * 0.239)?.toString(),
      });
    }

    let recordsProcessed = 0;
    for (const [day, metrics] of Array.from(dateMap.entries())) {
      await storage.upsertWearableDailyMetrics({
        userId,
        provider: 'whoop',
        date: new Date(day),
        ...metrics,
        rawPayload: { recovery: recoveryData, sleep: sleepData, cycle: cycleData },
      } as InsertWearableDailyMetrics);
      recordsProcessed++;
    }

    await storage.updateWearableSyncLog(syncLog.id, {
      status: 'success',
      syncFinishedAt: new Date(),
      recordsProcessed,
    });

    const connection = await storage.getWearableConnection(userId, 'whoop');
    if (connection) {
      await storage.updateWearableConnection(connection.id, { lastSyncedAt: new Date() });
    }

    return recordsProcessed;
  } catch (error) {
    await storage.updateWearableSyncLog(syncLog.id, {
      status: 'error',
      syncFinishedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export function calculateWearableInsights(metrics: WearableDailyMetrics[]) {
  if (metrics.length === 0) {
    return null;
  }

  const last7Days = metrics.slice(0, 7);
  const previous7Days = metrics.slice(7, 14);

  const avgSleep = last7Days.reduce((sum, m) => sum + (m.sleepDurationMinutes || 0), 0) / last7Days.length;
  const avgHrv = last7Days.reduce((sum, m) => sum + (parseFloat(m.hrvMs?.toString() || '0')), 0) / last7Days.length;
  const avgRhr = last7Days.reduce((sum, m) => sum + (parseFloat(m.restingHr?.toString() || '0')), 0) / last7Days.length;
  const avgSteps = last7Days.reduce((sum, m) => sum + (m.steps || 0), 0) / last7Days.length;

  const prevAvgSleep = previous7Days.length > 0 
    ? previous7Days.reduce((sum, m) => sum + (m.sleepDurationMinutes || 0), 0) / previous7Days.length 
    : avgSleep;
  const prevAvgHrv = previous7Days.length > 0 
    ? previous7Days.reduce((sum, m) => sum + (parseFloat(m.hrvMs?.toString() || '0')), 0) / previous7Days.length 
    : avgHrv;

  const getTrend = (current: number, previous: number): 'improving' | 'stable' | 'declining' => {
    const diff = current - previous;
    const threshold = previous * 0.05;
    if (diff > threshold) return 'improving';
    if (diff < -threshold) return 'declining';
    return 'stable';
  };

  const flags: string[] = [];
  if (avgHrv < prevAvgHrv * 0.85) flags.push('HRV significantly down - prioritize recovery');
  if (avgSleep < 360) flags.push('Sleep below 6 hours - increase sleep priority');
  if (avgSteps < 5000) flags.push('Low movement - increase daily activity');

  const latestRecovery = last7Days[0]?.recoveryScore || last7Days[0]?.readinessScore;
  let recoveryStatus: 'optimal' | 'good' | 'moderate' | 'low' = 'good';
  if (latestRecovery) {
    if (latestRecovery >= 85) recoveryStatus = 'optimal';
    else if (latestRecovery >= 67) recoveryStatus = 'good';
    else if (latestRecovery >= 34) recoveryStatus = 'moderate';
    else recoveryStatus = 'low';
  }

  return {
    sleepTrend: {
      average: Math.round(avgSleep),
      trend: getTrend(avgSleep, prevAvgSleep),
      lastWeek: last7Days.map(m => m.sleepDurationMinutes || 0),
    },
    hrvTrend: {
      average: Math.round(avgHrv),
      trend: getTrend(avgHrv, prevAvgHrv),
      lastWeek: last7Days.map(m => parseFloat(m.hrvMs?.toString() || '0')),
    },
    restingHrTrend: {
      average: Math.round(avgRhr),
      trend: getTrend(avgRhr, avgRhr) as 'improving' | 'stable' | 'declining',
      lastWeek: last7Days.map(m => parseFloat(m.restingHr?.toString() || '0')),
    },
    activityTrend: {
      averageSteps: Math.round(avgSteps),
      trend: getTrend(avgSteps, avgSteps) as 'improving' | 'stable' | 'declining',
      lastWeek: last7Days.map(m => m.steps || 0),
    },
    recoveryStatus,
    flags,
  };
}
