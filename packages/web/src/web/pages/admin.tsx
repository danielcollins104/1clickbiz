import { useState } from "react";
import { Link } from "wouter";
import {
  useAdminStatus,
  useAdminOverview,
  useAdminCustomers,
  useAdminCustomer,
  useAdminErrors,
  useAdminMessages,
  useAdminComp,
  useResolveMessage,
  useAdminOutputs,
} from "../queries/admin";
import { PageLoader } from "../components/protected-route";
import { PRODUCTS, planIdFor } from "../../api/catalog";
import { money } from "../lib/format";
import { errorMessage } from "../queries/business";
const date = (d: Date | string) => new Date(d).toLocaleDateString();
function ReadOnly({ value }: { value: unknown }) {
  if (value == null) return null;
  if (typeof value !== "object")
    return (
      <p className="whitespace-pre-wrap break-words leading-relaxed">
        {String(value)}
      </p>
    );
  if ("url" in value && typeof value.url === "string" && "key" in value)
    return (
      <img
        src={value.url}
        alt="Generated asset"
        className="b3 max-h-80 max-w-full object-contain bg-paper"
      />
    );
  if (Array.isArray(value))
    return (
      <div className="space-y-4">
        {value.map((v, i) => (
          <div className="border-l-[3px] border-ink pl-4" key={i}>
            <ReadOnly value={v} />
          </div>
        ))}
      </div>
    );
  return (
    <dl className="space-y-4">
      {Object.entries(value).map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-extrabold uppercase tracking-wide">
            {k.replace(/([A-Z])/g, " $1")}
          </dt>
          <dd className="mt-1">
            <ReadOnly value={v} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
function Output({ id }: { id: number }) {
  const { data, error, isLoading } = useAdminOutputs(id);
  const [tool, setTool] = useState("");
  if (isLoading) return <p className="p-5">Loading outputs…</p>;
  if (error) return <p role="alert">{errorMessage(error)}</p>;
  const a = data?.assets.find((a) => a.tool === tool);
  return (
    <section className="b3 bg-paper p-5 mt-6">
      <h3 className="display text-2xl">{data?.business.name} — read only</h3>
      <label className="block font-bold mt-4">
        Tool
        <select
          className="input mt-2"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
        >
          <option value="">Choose output</option>
          {data?.assets
            .filter((a) => a.content)
            .map((a) => (
              <option key={a.tool} value={a.tool}>
                {PRODUCTS.find((p) => p.slug === a.tool)?.name ?? a.tool}
              </option>
            ))}
        </select>
      </label>
      <div className="mt-5">
        <ReadOnly value={a?.content} />
      </div>
    </section>
  );
}
function CustomerDetail({ id, close }: { id: string; close: () => void }) {
  const { data: u, error } = useAdminCustomer(id);
  const comp = useAdminComp();
  const [plan, setPlan] = useState("phase_1_launch");
  const [biz, setBiz] = useState(0);
  return (
    <section className="card bg-cream p-6 mt-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h2 className="display text-3xl">{u?.name ?? "Customer"}</h2>
        <button className="btn btn-sm btn-quiet" onClick={close}>
          Close detail
        </button>
      </div>
      {error && <p role="alert">{errorMessage(error)}</p>}
      {u && (
        <>
          <p className="mt-4 break-all font-bold">
            {u.email} · {u.verified ? "Verified" : "Unverified"} · Joined{" "}
            {date(u.createdAt)}
          </p>
          <p className="mt-2 font-bold">
            {money(u.monthly)}/mo · {u.used}/{u.granted} generations used
          </p>
          <div className="mt-6 space-y-3">
            {u.plans.map((p) => (
              <div
                className="b3 bg-paper p-3 flex flex-wrap items-center justify-between gap-3"
                key={p.id}
              >
                <span className="font-bold">
                  {p.name} · {p.comp ? "Comp / free" : `${money(p.monthly)}/mo`}
                  {p.canceling ? " · Ending" : ""}
                </span>
                {p.comp && (
                  <button
                    className="btn btn-sm"
                    disabled={comp.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          `Revoke ${p.name} for ${u.email}? Access ends immediately.`,
                        )
                      )
                        comp.mutate({ userId: id, planId: p.id, revoke: true });
                    }}
                  >
                    Revoke comp
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="font-extrabold">Grant a free plan (no card charge)</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                aria-label="Plan to comp"
                className="input !w-auto max-w-full"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                {PRODUCTS.map((p) => (
                  <option key={p.slug} value={planIdFor(p.slug)}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                className="btn"
                disabled={comp.isPending}
                onClick={() => {
                  if (confirm(`Give ${u.email} this plan free until revoked?`))
                    comp.mutate({ userId: id, planId: plan, revoke: false });
                }}
              >
                {comp.isPending ? "Working…" : "Grant free plan"}
              </button>
            </div>
            <p className="mt-2 text-xs font-bold">
              Does not modify an existing paid subscription. Every action is
              logged.
            </p>
            {comp.error && (
              <p role="alert" className="mt-3 font-bold">
                {errorMessage(comp.error)}
              </p>
            )}
            {comp.isSuccess && (
              <output className="mt-3 font-bold">
                Saved. Billing data may take a few seconds to sync.
              </output>
            )}
          </div>
          <h3 className="display mt-8 text-2xl">
            Businesses ({u.businesses.length})
          </h3>
          <div className="mt-4 space-y-3">
            {u.businesses.map((b) => (
              <div
                className="b3 bg-paper p-3 flex flex-wrap items-center justify-between gap-3"
                key={b.id}
              >
                <span className="font-bold">{b.name}</span>
                <div className="flex gap-4">
                  <a
                    href={`/sites/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ulink font-bold"
                  >
                    Live site ↗
                  </a>
                  <button
                    className="ulink font-bold"
                    onClick={() => setBiz(b.id)}
                  >
                    Read outputs
                  </button>
                </div>
              </div>
            ))}
          </div>
          {biz > 0 && <Output id={biz} />}
          <h3 className="display mt-8 text-2xl">Recent errors</h3>
          {u.errors.length ? (
            u.errors.map((e) => (
              <p className="mt-3 font-bold" key={e.id}>
                {date(e.createdAt)} · {e.tool} — {e.error}
              </p>
            ))
          ) : (
            <p className="mt-3">No recorded errors.</p>
          )}
          <h3 className="display mt-8 text-2xl">Comp audit</h3>
          {u.audit.map((a) => (
            <p key={a.id} className="mt-3 text-sm break-words">
              {date(a.createdAt)} · {a.action} · {a.planId} · {a.actor}
            </p>
          ))}
        </>
      )}
    </section>
  );
}
export default function AdminPage() {
  const { data: status, isLoading } = useAdminStatus();
  const allowed = !!status?.allowed;
  const [tab, setTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState("");
  const overview = useAdminOverview(allowed);
  const customers = useAdminCustomers(
    search,
    page,
    allowed && tab === "Customers",
  );
  const errors = useAdminErrors(page, allowed && tab === "Errors");
  const messages = useAdminMessages(allowed && tab === "Messages");
  const resolve = useResolveMessage();
  if (isLoading) return <PageLoader label="Checking access" />;
  if (!allowed)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="display text-7xl">404.</h1>
        <p className="mt-5 font-bold">Page not found.</p>
        <Link className="btn mt-6" to="/dashboard">
          Dashboard
        </Link>
      </div>
    );
  const o = overview.data;
  const error =
    overview.error ||
    customers.error ||
    errors.error ||
    messages.error ||
    resolve.error;
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <p className="font-extrabold text-xs uppercase tracking-[0.2em]">
        Owner console · verified access only
      </p>
      <h1 className="display text-6xl md:text-8xl mt-3">Control room.</h1>
      <p className="mt-4 font-bold">
        {o?.sandbox
          ? "SANDBOX — all billing numbers are test data."
          : "LIVE BILLING"}{" "}
        · Revenue snapshot refreshes every minute.
      </p>
      <nav className="flex flex-wrap gap-3 mt-8">
        {["Overview", "Customers", "Errors", "Messages"].map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? "" : "btn-quiet"}`}
            onClick={() => {
              setTab(t);
              setPage(0);
              setSelected("");
            }}
          >
            {t}
          </button>
        ))}
      </nav>
      {error && (
        <p role="alert" className="b3 bg-paper p-4 mt-6 font-bold">
          {errorMessage(error)}
        </p>
      )}
      {tab === "Overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {[
              ["MRR", o ? money(o.mrr) : "…"],
              ["Customers", o?.customers],
              ["Active subscriptions", o?.activeSubscriptions],
              ["Bundle / single", o ? `${o.bundles} / ${o.singles}` : "…"],
              ["New this week", o?.new7],
              ["New this month", o?.new30],
              ["Generation failures", o?.errors],
              ["App emails", o?.emailReady ? "On" : "Off"],
            ].map(([label, value]) => (
              <article className="card bg-paper p-5" key={label}>
                <p className="font-extrabold uppercase text-xs">{label}</p>
                <p className="display text-3xl mt-4">{value ?? "…"}</p>
              </article>
            ))}
          </div>
          <section className="b3 bg-cream p-6 mt-8">
            <h2 className="display text-2xl">Launch readiness</h2>
            <ul className="mt-4 space-y-3 font-bold">
              <li>
                Payments:{" "}
                {o?.sandbox
                  ? "Test mode. Connect live Stripe in Autumn and add a live key."
                  : "Live mode"}
              </li>
              <li>
                Resend:{" "}
                {o?.emailReady
                  ? "Configured"
                  : "Not configured. Emails are wired but not sent."}
              </li>
              <li>
                Billing webhook:{" "}
                {o?.webhookReady
                  ? "Configured"
                  : "Not configured. Add the signing secret to enable billing emails."}
              </li>
            </ul>
            <p className="mt-5 text-sm">
              MRR is recurring base-price revenue for registered app customers
              in the current billing environment, before tax and any discounts.
              Includes cancel-at-period-end plans until they end; free comps
              count as $0. It is not cash collected.
            </p>
            {!!o?.unavailable && (
              <p role="alert" className="mt-4 font-bold">
                Billing unavailable for {o.unavailable} customer(s). Totals are
                incomplete.
              </p>
            )}
          </section>
        </>
      )}
      {tab === "Customers" && (
        <>
          <label className="block font-bold mt-8">
            Search customers
            <input
              className="input mt-2 max-w-lg"
              aria-label="Search customers"
                placeholder="Name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <div className="overflow-x-auto b3 bg-paper mt-6">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-ink text-paper">
                <tr>
                  {[
                    "Customer",
                    "Joined",
                    "Plans",
                    "Monthly",
                    "AI used",
                    "Businesses",
                  ].map((t) => (
                    <th className="p-4 text-xs uppercase" key={t}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.data?.rows.map((u) => (
                  <tr key={u.id} className="border-t-[3px] border-ink">
                    <td className="p-4">
                      <button
                        className="ulink font-extrabold"
                        onClick={() => setSelected(u.id)}
                      >
                        {u.name}
                      </button>
                      <p className="text-sm">{u.email}</p>
                    </td>
                    <td className="p-4 text-sm">{date(u.createdAt)}</td>
                    <td className="p-4 text-sm font-bold">
                      {u.billingUnavailable
                        ? "Unavailable"
                        : u.plans.map((p) => p.name).join(", ") || "None"}
                    </td>
                    <td className="p-4 font-bold">
                      {u.billingUnavailable ? "—" : money(u.monthly)}
                    </td>
                    <td className="p-4">
                      {u.used}/{u.granted}
                    </td>
                    <td className="p-4">{u.businesses.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.isLoading && <p className="mt-5">Loading customers…</p>}
          {customers.data?.total === 0 && (
            <p className="mt-5 font-bold">No matching customers.</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <button
              className="btn btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="font-bold">
              Page {page + 1} · {customers.data?.total ?? 0} customers
            </span>
            <button
              className="btn btn-sm"
              disabled={(page + 1) * 20 >= (customers.data?.total ?? 0)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
          {selected && (
            <CustomerDetail
              key={selected}
              id={selected}
              close={() => setSelected("")}
            />
          )}
        </>
      )}
      {tab === "Errors" && (
        <section className="mt-8 space-y-4">
          {errors.data?.rows.map((e) => (
            <article className="card bg-paper p-5" key={e.id}>
              <p className="font-extrabold">
                {e.tool} · Business #{e.businessId} · {date(e.createdAt)}
              </p>
              <p className="mt-3 font-bold">{e.error}</p>
              <button
                className="ulink mt-3"
                onClick={() => {
                  setSelected(e.userId);
                  setTab("Customers");
                }}
              >
                View customer
              </button>
            </article>
          ))}
          {!errors.isLoading && !errors.data?.rows.length && (
            <p className="font-bold">No generation errors recorded.</p>
          )}
          <div className="flex items-center gap-4">
            <button
              className="btn btn-sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page + 1}</span>
            <button
              className="btn btn-sm"
              disabled={(page + 1) * 30 >= (errors.data?.total ?? 0)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </section>
      )}
      {tab === "Messages" && (
        <section className="mt-8 space-y-4">
          {messages.data?.map((m) => (
            <article className="card bg-paper p-5" key={m.id}>
              <div className="flex flex-wrap justify-between gap-4">
                <h2 className="font-extrabold">
                  {m.name} · {date(m.createdAt)}
                </h2>
                <button
                  className="btn btn-sm btn-quiet"
                  disabled={resolve.isPending}
                  onClick={() =>
                    resolve.mutate({ id: m.id, resolved: !m.resolved })
                  }
                >
                  {m.resolved ? "Reopen" : "Mark resolved"}
                </button>
              </div>
              <a
                className="ulink mt-3 block break-all"
                href={`mailto:${m.email}`}
              >
                {m.email}
              </a>
              <p className="whitespace-pre-wrap mt-4">{m.message}</p>
            </article>
          ))}
          {!messages.isLoading && !messages.data?.length && (
            <p className="font-bold">No support messages yet.</p>
          )}
        </section>
      )}
    </div>
  );
}
