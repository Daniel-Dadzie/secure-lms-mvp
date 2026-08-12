"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { AdminCoupon } from "@/types/admin";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxUses: "",
  });

  async function reloadCoupons() {
    setLoading(true);
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data.coupons ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/admin/coupons");
        if (!cancelled) {
          setCoupons(res.data.coupons ?? []);
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
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/admin/coupons", {
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
    });
    setShowForm(false);
    setForm({ code: "", discountType: "PERCENTAGE", discountValue: 10, maxUses: "" });
    reloadCoupons();
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this coupon?")) return;
    await api.delete(`/admin/coupons/${id}`);
    reloadCoupons();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Manage discount codes and promotions.</p>
        </div>
        <Button className="bg-[#0A4A3A]" onClick={() => setShowForm(true)}>Add Coupon</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" className="rounded-lg border px-3 py-2 text-sm" required />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
          </select>
          <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} placeholder="Value" className="rounded-lg border px-3 py-2 text-sm" required />
          <input value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Max uses (optional)" className="rounded-lg border px-3 py-2 text-sm" />
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Code", "Type", "Value", "Uses", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-sm font-bold">{c.code}</td>
                  <td className="px-4 py-3 text-sm">{c.discountType}</td>
                  <td className="px-4 py-3 text-sm">{c.discountValue}{c.discountType === "PERCENTAGE" ? "%" : " cents"}</td>
                  <td className="px-4 py-3 text-sm">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3"><Badge variant={c.isActive ? "green" : "slate"}>{c.isActive ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    {c.isActive && (
                      <Button size="sm" variant="outline" onClick={() => handleDeactivate(c.id)}>Deactivate</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
