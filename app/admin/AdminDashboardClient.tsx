"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { AdminDashboardData } from "@/lib/admin";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatBytes(value: number | null) {
  if (!value) return "0 B";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

function truncateId(value: string | null) {
  if (!value) return "--";
  return value.length > 10 ? `${value.slice(0, 8)}...` : value;
}

export default function AdminDashboardClient({
  data,
  adminEmail,
}: {
  data: AdminDashboardData;
  adminEmail: string;
}) {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const maxDailyTraffic = Math.max(...data.dailyTraffic.map((point) => point.requestCount), 1);

  const copy = zh ? {
    eyebrow: "管理后台",
    title: "用户数据与 API 流量总览",
    description: "后台聚合展示用户账户、宠物、测试报告、写真生成与接口流量数据，方便你快速看清产品运行情况。",
    signedInAs: "当前管理员",
    generatedAt: "生成时间",
    setupTitle: "后台配置尚未完成",
    warningTitle: "需要处理的配置项",
    securityTitle: "安全说明",
    securityBody: "用户密码不会在后台展示，也无法从 Supabase 明文读取。这是正常且必要的安全设计。建议查看邮箱、注册时间、最近登录、验证状态、登录方式、生成次数和测试结果。",
    users: "注册用户",
    pets: "宠物档案",
    reports: "测试报告",
    portraits: "写真生成",
    apiRequests: "24 小时 API 请求",
    apiErrors: "24 小时 API 错误",
    avgLatency: "24 小时平均耗时",
    visualProfiles: "视觉分析记录",
    recentUsers: "最近用户",
    recentUsersDesc: "展示最近认证用户的账户状态、内容生成量，以及最近一次测试结果。",
    email: "邮箱",
    verified: "已验证",
    provider: "登录方式",
    created: "注册时间",
    lastSignIn: "最近登录",
    petsCount: "宠物数",
    reportsCount: "报告数",
    portraitsCount: "写真数",
    latestResult: "最近结果",
    noUsers: "暂无用户数据。",
    yes: "是",
    no: "否",
    none: "暂无",
    last7Days: "最近 7 天 API 趋势",
    last7DaysDesc: "按天统计请求量，并标出错误请求数。",
    noTraffic: "暂无 API 日志，或日志表还未启用。",
    topRoutes: "热门 API 路由",
    topRoutesDesc: "按最近 7 天请求量排序，帮助你识别最常用的接口。",
    req: "请求",
    err: "错误",
    reqBytes: "请求体积",
    recentReports: "最近测试报告",
    recentReportsDesc: "查看最近完成测试的宠物及其 PBTI 结果。",
    pet: "宠物",
    type: "类型",
    user: "用户",
    time: "时间",
    noReports: "暂无报告记录。",
    recentLogs: "最近 API 调用明细",
    recentLogsDesc: "最新 30 条接口请求，便于排查错误、观察高频路径和延迟。",
    route: "路由",
    status: "状态",
    latency: "耗时",
    resBytes: "响应体积",
    error: "错误信息",
    noLogs: "暂无 API 调用日志。",
  } : {
    eyebrow: "Admin dashboard",
    title: "Users and API traffic overview",
    description: "This view brings together account activity, pets, test reports, portrait generation, and backend API traffic so you can see how the product is behaving at a glance.",
    signedInAs: "Signed in as",
    generatedAt: "Generated",
    setupTitle: "Admin setup is incomplete",
    warningTitle: "Configuration warnings",
    securityTitle: "Security note",
    securityBody: "User passwords are not shown here and cannot be read in plaintext from Supabase. That is expected and important for security. Track email, signup time, last sign-in, verification, login providers, generation counts, and test results instead.",
    users: "Users",
    pets: "Pets",
    reports: "Reports",
    portraits: "Portraits",
    apiRequests: "API requests (24h)",
    apiErrors: "API errors (24h)",
    avgLatency: "Avg latency (24h)",
    visualProfiles: "Visual profiles",
    recentUsers: "Recent users",
    recentUsersDesc: "Latest authenticated users with account status, generation volume, and their latest test result.",
    email: "Email",
    verified: "Verified",
    provider: "Provider",
    created: "Created",
    lastSignIn: "Last sign-in",
    petsCount: "Pets",
    reportsCount: "Reports",
    portraitsCount: "Portraits",
    latestResult: "Latest result",
    noUsers: "No user data available yet.",
    yes: "Yes",
    no: "No",
    none: "None",
    last7Days: "API traffic in the last 7 days",
    last7DaysDesc: "Daily request volume with error counts for each day.",
    noTraffic: "No API traffic yet, or the analytics table has not been enabled.",
    topRoutes: "Top API routes",
    topRoutesDesc: "Ranked by request count over the last 7 days.",
    req: "Requests",
    err: "Errors",
    reqBytes: "Request bytes",
    recentReports: "Recent reports",
    recentReportsDesc: "A quick look at the latest completed tests and their resulting PBTI types.",
    pet: "Pet",
    type: "Type",
    user: "User",
    time: "Time",
    noReports: "No report records available yet.",
    recentLogs: "Recent API request log",
    recentLogsDesc: "Latest 30 requests to help debug failures, spot hot paths, and inspect latency.",
    route: "Route",
    status: "Status",
    latency: "Latency",
    resBytes: "Response bytes",
    error: "Error",
    noLogs: "No API request logs available yet.",
  };

  const totals = [
    { label: copy.users, value: formatNumber(data.totals.users), note: "users_profile" },
    { label: copy.pets, value: formatNumber(data.totals.pets), note: "pets" },
    { label: copy.reports, value: formatNumber(data.totals.reports), note: "personality_results" },
    { label: copy.portraits, value: formatNumber(data.totals.portraits), note: "pet_portraits" },
    { label: copy.apiRequests, value: formatNumber(data.totals.apiRequests24h), note: "api_request_logs" },
    { label: copy.apiErrors, value: formatNumber(data.totals.apiErrors24h), note: "status >= 400" },
    { label: copy.avgLatency, value: `${formatNumber(data.totals.avgApiDuration24h)} ms`, note: "duration_ms" },
    { label: copy.visualProfiles, value: formatNumber(data.totals.visualProfiles), note: "pet_visual_profiles" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="rounded-[2rem] border border-[#eaded2] bg-[#171514] p-8 text-white shadow-[0_24px_70px_rgba(52,34,20,.12)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[.18em] text-[#ffb878]">
              {copy.eyebrow}
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
              {copy.description}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/6 px-5 py-4 text-sm text-white/72">
            <div>{copy.signedInAs}</div>
            <div className="mt-1 font-black text-white">{adminEmail}</div>
            <div className="mt-2 text-xs">
              {copy.generatedAt}: {formatTime(data.generatedAt)}
            </div>
          </div>
        </div>
      </section>

      {data.setupError ? (
        <section className="mt-6 rounded-[1.75rem] border border-[#f7b689] bg-[#fff3e6] p-6 text-[#7b4317]">
          <h2 className="text-xl font-black">{copy.setupTitle}</h2>
          <p className="mt-3 text-sm leading-7">{data.setupError}</p>
        </section>
      ) : null}

      {data.warnings.length ? (
        <section className="mt-6 rounded-[1.75rem] border border-[#eaded2] bg-white p-6 shadow-[0_14px_40px_rgba(52,34,20,.06)]">
          <h2 className="text-xl font-black text-[#171514]">{copy.warningTitle}</h2>
          <div className="mt-4 space-y-3">
            {data.warnings.map((warning) => (
              <p key={warning} className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#8a4f22]">
                {warning}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-[1.75rem] border border-[#eaded2] bg-white p-6 shadow-[0_14px_40px_rgba(52,34,20,.06)]">
        <h2 className="text-xl font-black text-[#171514]">{copy.securityTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-[#655a51]">{copy.securityBody}</p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {totals.map((item) => (
          <article key={item.label} className="rounded-[1.6rem] border border-[#eaded2] bg-white p-5 shadow-[0_14px_36px_rgba(52,34,20,.05)]">
            <div className="text-xs font-black uppercase tracking-[.16em] text-[#d96612]">{item.label}</div>
            <div className="mt-3 text-4xl font-black tracking-[-.05em] text-[#171514]">{item.value}</div>
            <div className="mt-2 text-xs text-[#8d8076]">{item.note}</div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_16px_45px_rgba(52,34,20,.06)]">
          <div>
            <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{copy.recentUsers}</h2>
            <p className="mt-2 text-sm text-[#7a6d63]">{copy.recentUsersDesc}</p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[.14em] text-[#9a8d83]">
                <tr>
                  <th className="pb-3 pr-4">{copy.email}</th>
                  <th className="pb-3 pr-4">{copy.verified}</th>
                  <th className="pb-3 pr-4">{copy.provider}</th>
                  <th className="pb-3 pr-4">{copy.created}</th>
                  <th className="pb-3 pr-4">{copy.lastSignIn}</th>
                  <th className="pb-3 pr-4">{copy.petsCount}</th>
                  <th className="pb-3 pr-4">{copy.reportsCount}</th>
                  <th className="pb-3 pr-4">{copy.portraitsCount}</th>
                  <th className="pb-3">{copy.latestResult}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6dc]">
                {data.recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#171514]">{user.email}</div>
                      <div className="text-xs text-[#8d8076]">{truncateId(user.id)}</div>
                    </td>
                    <td className="py-4 pr-4 text-[#655a51]">
                      <div>{user.emailConfirmedAt ? copy.yes : copy.no}</div>
                      <div className="text-xs text-[#8d8076]">{formatTime(user.emailConfirmedAt)}</div>
                    </td>
                    <td className="py-4 pr-4 text-[#655a51]">{user.providers.join(", ") || copy.none}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{formatTime(user.createdAt)}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{formatTime(user.lastSignInAt)}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{formatNumber(user.petCount)}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{formatNumber(user.reportCount)}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{formatNumber(user.portraitCount)}</td>
                    <td className="py-4 text-[#655a51]">
                      <div className="font-bold text-[#171514]">{user.latestResultType || copy.none}</div>
                      <div className="text-xs text-[#8d8076]">
                        {user.latestResultPetName || copy.none} · {formatTime(user.latestResultAt)}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.recentUsers.length === 0 ? (
                  <tr>
                    <td className="py-6 text-[#8d8076]" colSpan={9}>
                      {copy.noUsers}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_16px_45px_rgba(52,34,20,.06)]">
          <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{copy.last7Days}</h2>
          <p className="mt-2 text-sm text-[#7a6d63]">{copy.last7DaysDesc}</p>
          <div className="mt-6 space-y-4">
            {data.dailyTraffic.map((point) => (
              <div key={point.date}>
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[.12em] text-[#7a6d63]">
                  <span>{point.date}</span>
                  <span>{formatNumber(point.requestCount)} / {formatNumber(point.errorCount)}</span>
                </div>
                <div className="h-3 rounded-full bg-[#f4e9dd]">
                  <div
                    className="h-full rounded-full bg-[#ff7a1a]"
                    style={{ width: `${Math.max(6, (point.requestCount / maxDailyTraffic) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data.dailyTraffic.length === 0 ? (
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-5 text-sm text-[#8d8076]">
                {copy.noTraffic}
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_16px_45px_rgba(52,34,20,.06)]">
          <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{copy.topRoutes}</h2>
          <p className="mt-2 text-sm text-[#7a6d63]">{copy.topRoutesDesc}</p>
          <div className="mt-6 space-y-4">
            {data.routeMetrics.map((metric) => (
              <div key={metric.key} className="rounded-[1.4rem] border border-[#f0e6dc] bg-[#fffaf4] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[.14em] text-[#d96612]">{metric.method}</div>
                    <div className="mt-1 font-black text-[#171514]">{metric.route}</div>
                  </div>
                  <div className="text-right text-sm text-[#655a51]">
                    <div>{formatNumber(metric.requestCount)} {copy.req}</div>
                    <div>{formatNumber(metric.errorCount)} {copy.err}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#7a6d63]">
                  <div>{copy.avgLatency}: <span className="font-black text-[#171514]">{metric.avgDurationMs} ms</span></div>
                  <div>{copy.reqBytes}: <span className="font-black text-[#171514]">{formatBytes(metric.totalRequestBytes)}</span></div>
                </div>
              </div>
            ))}
            {data.routeMetrics.length === 0 ? (
              <div className="rounded-2xl bg-[#fff8ef] px-4 py-5 text-sm text-[#8d8076]">
                {copy.noTraffic}
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_16px_45px_rgba(52,34,20,.06)]">
          <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{copy.recentReports}</h2>
          <p className="mt-2 text-sm text-[#7a6d63]">{copy.recentReportsDesc}</p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[.14em] text-[#9a8d83]">
                <tr>
                  <th className="pb-3 pr-4">{copy.pet}</th>
                  <th className="pb-3 pr-4">{copy.type}</th>
                  <th className="pb-3 pr-4">{copy.user}</th>
                  <th className="pb-3">{copy.time}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6dc]">
                {data.recentReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#171514]">{report.petName}</div>
                      <div className="text-xs text-[#8d8076]">{report.species}</div>
                    </td>
                    <td className="py-4 pr-4 font-bold text-[#d96612]">{report.personalityType}</td>
                    <td className="py-4 pr-4 text-[#655a51]">{truncateId(report.userId)}</td>
                    <td className="py-4 text-[#655a51]">{formatTime(report.createdAt)}</td>
                  </tr>
                ))}
                {data.recentReports.length === 0 ? (
                  <tr>
                    <td className="py-6 text-[#8d8076]" colSpan={4}>
                      {copy.noReports}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-[1.8rem] border border-[#eaded2] bg-white p-6 shadow-[0_16px_45px_rgba(52,34,20,.06)]">
        <h2 className="text-2xl font-black tracking-[-.04em] text-[#171514]">{copy.recentLogs}</h2>
        <p className="mt-2 text-sm text-[#7a6d63]">{copy.recentLogsDesc}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[.14em] text-[#9a8d83]">
              <tr>
                <th className="pb-3 pr-4">{copy.time}</th>
                <th className="pb-3 pr-4">{copy.route}</th>
                <th className="pb-3 pr-4">{copy.status}</th>
                <th className="pb-3 pr-4">{copy.latency}</th>
                <th className="pb-3 pr-4">{copy.reqBytes}</th>
                <th className="pb-3 pr-4">{copy.resBytes}</th>
                <th className="pb-3 pr-4">{copy.user}</th>
                <th className="pb-3">{copy.error}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e6dc]">
              {data.recentApiLogs.map((log) => (
                <tr key={log.id}>
                  <td className="py-4 pr-4 text-[#655a51]">{formatTime(log.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <div className="font-black text-[#171514]">{log.method}</div>
                    <div className="text-xs text-[#8d8076]">{log.route}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${log.status >= 400 ? "bg-[#ffe3dc] text-[#c9471e]" : "bg-[#ecf7ee] text-[#2a7b3f]"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-[#655a51]">{log.durationMs} ms</td>
                  <td className="py-4 pr-4 text-[#655a51]">{formatBytes(log.requestBytes)}</td>
                  <td className="py-4 pr-4 text-[#655a51]">{formatBytes(log.responseBytes)}</td>
                  <td className="py-4 pr-4 text-[#655a51]">{truncateId(log.userId)}</td>
                  <td className="py-4 text-[#655a51]">{log.errorMessage || "--"}</td>
                </tr>
              ))}
              {data.recentApiLogs.length === 0 ? (
                <tr>
                  <td className="py-6 text-[#8d8076]" colSpan={8}>
                    {copy.noLogs}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
