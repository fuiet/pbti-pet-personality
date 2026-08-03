import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RecentAuthUser = {
  id: string;
  email: string;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  providers: string[];
  petCount: number;
  reportCount: number;
  portraitCount: number;
  latestResultType: string | null;
  latestResultAt: string | null;
  latestResultPetName: string | null;
};

type RecentReport = {
  id: string;
  pbtiId: string;
  personalityType: string;
  createdAt: string;
  petName: string;
  species: string;
  userId: string;
};

type RecentApiLog = {
  id: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  requestBytes: number | null;
  responseBytes: number | null;
  userId: string | null;
  createdAt: string;
  errorMessage: string | null;
};

type RouteMetric = {
  key: string;
  route: string;
  method: string;
  requestCount: number;
  errorCount: number;
  avgDurationMs: number;
  totalRequestBytes: number;
};

type DailyTrafficPoint = {
  date: string;
  requestCount: number;
  errorCount: number;
};

export type AdminDashboardData = {
  setupError: string | null;
  warnings: string[];
  generatedAt: string;
  totals: {
    users: number;
    pets: number;
    reports: number;
    portraits: number;
    visualProfiles: number;
    apiRequests24h: number;
    apiErrors24h: number;
    avgApiDuration24h: number;
  };
  recentUsers: RecentAuthUser[];
  recentReports: RecentReport[];
  routeMetrics: RouteMetric[];
  recentApiLogs: RecentApiLog[];
  dailyTraffic: DailyTrafficPoint[];
};

type CountResult = {
  count: number;
  warning: string | null;
};

const EMPTY_DASHBOARD_DATA: AdminDashboardData = {
  setupError: null,
  warnings: [],
  generatedAt: "",
  totals: {
    users: 0,
    pets: 0,
    reports: 0,
    portraits: 0,
    visualProfiles: 0,
    apiRequests24h: 0,
    apiErrors24h: 0,
    avgApiDuration24h: 0,
  },
  recentUsers: [],
  recentReports: [],
  routeMetrics: [],
  recentApiLogs: [],
  dailyTraffic: [],
};

function getAdminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isMissingRelation(error: { code?: string; message?: string } | null | undefined, relation: string) {
  const message = error?.message?.toLowerCase() || "";
  return error?.code === "42P01" || message.includes(relation.toLowerCase()) || message.includes("schema cache");
}

function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function loadExactCount(client: any, table: string): Promise<CountResult> {
  const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) {
    if (isMissingRelation(error, table)) {
      return { count: 0, warning: `Missing table or schema cache for ${table}.` };
    }
    throw new Error(error.message);
  }
  return { count: count || 0, warning: null };
}

function summarizeRouteMetrics(logs: Array<{ route: string; method: string; status: number; duration_ms: number; request_bytes: number | null }>) {
  const metrics = new Map<string, RouteMetric>();

  for (const log of logs) {
    const key = `${log.method} ${log.route}`;
    const current = metrics.get(key) || {
      key,
      route: log.route,
      method: log.method,
      requestCount: 0,
      errorCount: 0,
      avgDurationMs: 0,
      totalRequestBytes: 0,
    };
    current.requestCount += 1;
    current.errorCount += log.status >= 400 ? 1 : 0;
    current.avgDurationMs += Number.isFinite(log.duration_ms) ? log.duration_ms : 0;
    current.totalRequestBytes += Number.isFinite(log.request_bytes || 0) ? (log.request_bytes || 0) : 0;
    metrics.set(key, current);
  }

  return Array.from(metrics.values())
    .map((metric) => ({
      ...metric,
      avgDurationMs: metric.requestCount ? Math.round(metric.avgDurationMs / metric.requestCount) : 0,
    }))
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 8);
}

function summarizeDailyTraffic(logs: Array<{ created_at: string; status: number }>) {
  const days = new Map<string, DailyTrafficPoint>();

  for (const log of logs) {
    const date = log.created_at.slice(0, 10);
    const current = days.get(date) || { date, requestCount: 0, errorCount: 0 };
    current.requestCount += 1;
    current.errorCount += log.status >= 400 ? 1 : 0;
    days.set(date, current);
  }

  return Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function reduceCounts<T extends { user_id: string }>(rows: T[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
  }
  return counts;
}

function normalizeProviders(user: {
  app_metadata?: { providers?: unknown } | null;
  identities?: Array<{ provider?: string | null }> | null;
}) {
  const providers = new Set<string>();

  if (Array.isArray(user.app_metadata?.providers)) {
    for (const provider of user.app_metadata.providers) {
      if (typeof provider === "string" && provider.trim()) {
        providers.add(provider.trim());
      }
    }
  }

  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      if (typeof identity?.provider === "string" && identity.provider.trim()) {
        providers.add(identity.provider.trim());
      }
    }
  }

  return Array.from(providers);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmailSet().has(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user?.email) {
    redirect("/login?next=%2Fadmin");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return {
      ...EMPTY_DASHBOARD_DATA,
      generatedAt: new Date().toISOString(),
      setupError: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Add them before using /admin.",
    };
  }

  const warnings: string[] = [];
  const now = new Date();
  const since24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersCount,
    petsCount,
    reportsCount,
    portraitsCount,
    visualProfilesCount,
    recentUsersResult,
    recentReportsResult,
    apiRequests24hResult,
    apiErrors24hResult,
    routeLogsResult,
    recentApiLogsResult,
  ] = await Promise.all([
    loadExactCount(client, "users_profile"),
    loadExactCount(client, "pets"),
    loadExactCount(client, "personality_results"),
    loadExactCount(client, "pet_portraits"),
    loadExactCount(client, "pet_visual_profiles"),
    client.auth.admin.listUsers({ page: 1, perPage: 12 }),
    client
      .from("personality_results")
      .select("id,pbti_id,personality_type,created_at,user_id,pets(name,species)")
      .order("created_at", { ascending: false })
      .limit(12),
    client
      .from("api_request_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24Hours),
    client
      .from("api_request_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24Hours)
      .gte("status", 400),
    client
      .from("api_request_logs")
      .select("route,method,status,duration_ms,request_bytes,created_at")
      .gte("created_at", since7Days)
      .order("created_at", { ascending: false })
      .limit(2000),
    client
      .from("api_request_logs")
      .select("id,route,method,status,duration_ms,request_bytes,response_bytes,user_id,created_at,error_message")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  for (const result of [usersCount, petsCount, reportsCount, portraitsCount, visualProfilesCount]) {
    if (result.warning) warnings.push(result.warning);
  }

  if (recentUsersResult.error) {
    throw new Error(recentUsersResult.error.message);
  }

  if (recentReportsResult.error) {
    if (isMissingRelation(recentReportsResult.error, "personality_results")) {
      warnings.push("Missing table or schema cache for personality_results.");
    } else {
      throw new Error(recentReportsResult.error.message);
    }
  }

  const apiLogsMissing =
    (apiRequests24hResult.error && isMissingRelation(apiRequests24hResult.error, "api_request_logs"))
    || (apiErrors24hResult.error && isMissingRelation(apiErrors24hResult.error, "api_request_logs"))
    || (routeLogsResult.error && isMissingRelation(routeLogsResult.error, "api_request_logs"))
    || (recentApiLogsResult.error && isMissingRelation(recentApiLogsResult.error, "api_request_logs"));

  if (apiLogsMissing) {
    warnings.push("API metrics table api_request_logs is missing. Run supabase/admin-dashboard.sql to enable traffic analytics.");
  } else {
    for (const result of [apiRequests24hResult, apiErrors24hResult, routeLogsResult, recentApiLogsResult]) {
      if (result.error) throw new Error(result.error.message);
    }
  }

  const recentAuthUsers = recentUsersResult.data?.users || [];
  const recentUserIds = recentAuthUsers.map((user) => user.id);

  const [recentUserPetsResult, recentUserReportsResult, recentUserPortraitsResult, recentUserLatestResultsResult] = recentUserIds.length
    ? await Promise.all([
      client.from("pets").select("user_id").in("user_id", recentUserIds).limit(500),
      client.from("personality_results").select("user_id").in("user_id", recentUserIds).limit(500),
      client.from("pet_portraits").select("user_id").in("user_id", recentUserIds).limit(500),
      client
        .from("personality_results")
        .select("user_id,personality_type,created_at,pets(name)")
        .in("user_id", recentUserIds)
        .order("created_at", { ascending: false })
        .limit(500),
    ])
    : [
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ];

  if (recentUserPetsResult.error) throw new Error(recentUserPetsResult.error.message);
  if (recentUserReportsResult.error) throw new Error(recentUserReportsResult.error.message);
  if (recentUserPortraitsResult.error) throw new Error(recentUserPortraitsResult.error.message);
  if (recentUserLatestResultsResult.error) throw new Error(recentUserLatestResultsResult.error.message);

  const petCounts = reduceCounts((recentUserPetsResult.data || []) as Array<{ user_id: string }>);
  const reportCounts = reduceCounts((recentUserReportsResult.data || []) as Array<{ user_id: string }>);
  const portraitCounts = reduceCounts((recentUserPortraitsResult.data || []) as Array<{ user_id: string }>);
  const latestResults = new Map<string, {
    personalityType: string | null;
    createdAt: string | null;
    petName: string | null;
  }>();

  for (const row of (recentUserLatestResultsResult.data || []) as Array<{
    user_id: string;
    personality_type: string | null;
    created_at: string | null;
    pets?: { name?: string | null } | null;
  }>) {
    if (!latestResults.has(row.user_id)) {
      latestResults.set(row.user_id, {
        personalityType: row.personality_type || null,
        createdAt: row.created_at || null,
        petName: row.pets?.name || null,
      });
    }
  }

  const recentUsers: RecentAuthUser[] = recentAuthUsers.map((user) => ({
    id: user.id,
    email: user.email || "Unknown",
    createdAt: user.created_at || null,
    lastSignInAt: user.last_sign_in_at || null,
    emailConfirmedAt: user.email_confirmed_at || null,
    providers: normalizeProviders(user),
    petCount: petCounts.get(user.id) || 0,
    reportCount: reportCounts.get(user.id) || 0,
    portraitCount: portraitCounts.get(user.id) || 0,
    latestResultType: latestResults.get(user.id)?.personalityType || null,
    latestResultAt: latestResults.get(user.id)?.createdAt || null,
    latestResultPetName: latestResults.get(user.id)?.petName || null,
  }));

  const recentReports: RecentReport[] = ((recentReportsResult.data || []) as Array<{
    id: string;
    pbti_id: string;
    personality_type: string;
    created_at: string;
    user_id: string;
    pets?: { name?: string | null; species?: string | null } | null;
  }>).map((row) => ({
    id: row.id,
    pbtiId: row.pbti_id,
    personalityType: row.personality_type,
    createdAt: row.created_at,
    petName: row.pets?.name || "Unnamed pet",
    species: row.pets?.species || "unknown",
    userId: row.user_id,
  }));

  const apiLogsForSummary = ((routeLogsResult.data || []) as Array<{
    route: string;
    method: string;
    status: number;
    duration_ms: number;
    request_bytes: number | null;
    created_at: string;
  }>);
  const recentApiLogs: RecentApiLog[] = ((recentApiLogsResult.data || []) as Array<{
    id: string;
    route: string;
    method: string;
    status: number;
    duration_ms: number;
    request_bytes: number | null;
    response_bytes: number | null;
    user_id: string | null;
    created_at: string;
    error_message: string | null;
  }>).map((row) => ({
    id: row.id,
    route: row.route,
    method: row.method,
    status: row.status,
    durationMs: row.duration_ms,
    requestBytes: row.request_bytes,
    responseBytes: row.response_bytes,
    userId: row.user_id,
    createdAt: row.created_at,
    errorMessage: row.error_message,
  }));

  const apiRequests24h = apiLogsMissing ? 0 : (apiRequests24hResult.count || 0);
  const apiErrors24h = apiLogsMissing ? 0 : (apiErrors24hResult.count || 0);
  const apiDuration24hLogs = apiLogsForSummary.filter((log) => log.created_at >= since24Hours);
  const avgApiDuration24h = apiDuration24hLogs.length
    ? Math.round(apiDuration24hLogs.reduce((sum, log) => sum + (Number.isFinite(log.duration_ms) ? log.duration_ms : 0), 0) / apiDuration24hLogs.length)
    : 0;

  return {
    setupError: null,
    warnings,
    generatedAt: now.toISOString(),
    totals: {
      users: usersCount.count,
      pets: petsCount.count,
      reports: reportsCount.count,
      portraits: portraitsCount.count,
      visualProfiles: visualProfilesCount.count,
      apiRequests24h,
      apiErrors24h,
      avgApiDuration24h,
    },
    recentUsers,
    recentReports,
    routeMetrics: apiLogsMissing ? [] : summarizeRouteMetrics(apiLogsForSummary),
    recentApiLogs: apiLogsMissing ? [] : recentApiLogs,
    dailyTraffic: apiLogsMissing ? [] : summarizeDailyTraffic(apiLogsForSummary.map((log) => ({
      created_at: log.created_at,
      status: log.status,
    }))),
  };
}
