"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import type { AdminPurchase } from "@/types/admin";

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  async function reloadPurchases() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/admin/purchases", { params });
      setPurchases(res.data.purchases ?? []);
      setTotalPages(res.data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 20 };
        if (statusFilter) params.status = statusFilter;
        const res = await api.get("/admin/purchases", { params });
        if (!cancelled) {
          setPurchases(res.data.purchases ?? []);
          setTotalPages(res.data.totalPages ?? 1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  async function handleRefund(id: string) {
    if (!confirm("Mark this purchase as refunded?")) return;
    await api.patch(`/admin/purchases/${id}/refund`);
    reloadPurchases();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Purchases</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage platform transactions.</p>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        {["PENDING", "COMPLETED", "FAILED", "REFUNDED"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {["Buyer", "Course", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm">{p.user.fullName}</td>
                    <td className="px-4 py-3 text-sm">{p.course.title}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.finalAmountCents)}</td>
                    <td className="px-4 py-3"><Badge variant={p.status === "COMPLETED" ? "green" : p.status === "REFUNDED" ? "slate" : "amber"}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      {p.status === "COMPLETED" && (
                        <Button size="sm" variant="outline" onClick={() => handleRefund(p.id)}>Refund</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
