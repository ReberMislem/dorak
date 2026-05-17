"use client"

import React, { useEffect, useState } from "react"

type Plan = {
  id: string
  slug: string
  name: string
  description?: string
  interval: string
  price: number
  features?: any
  active: boolean
}

export default function PlansAdminPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ slug: "", name: "", description: "", interval: "MONTH", price: "0", features: "{" + '"maxQueues":2' + "}" })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    setLoading(true)
    try {
      const res = await fetch("/api/plans")
      const data = await res.json()
      setPlans(data)
    } catch (e: any) {
      setError(e?.message || "Failed to load plans")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        interval: form.interval,
        price: Number(form.price),
        features: JSON.parse(form.features || "{}"),
      }
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      setForm({ slug: "", name: "", description: "", interval: "MONTH", price: "0", features: "{" + '"maxQueues":2' + "}" })
      await fetchPlans()
    } catch (e: any) {
      setError(e?.message || "Create failed")
    }
  }

  // activate subscription form
  const [activateForm, setActivateForm] = useState({ shopId: "", planSlug: "" })
  const [activateMsg, setActivateMsg] = useState<string | null>(null)

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setActivateMsg(null)
    try {
      const res = await fetch('/api/admin/subscription/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shopId: activateForm.shopId, planSlug: activateForm.planSlug }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Activation failed')
      setActivateMsg('Activated')
    } catch (err: any) {
      setActivateMsg(err?.message || 'Failed')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Plans Management</h1>
      <div className="mb-6">
        <div className="mb-4 border p-3 rounded">
          <h3 className="font-medium mb-2">Activate Subscription for Shop</h3>
          <form onSubmit={handleActivate} className="space-y-2">
            <div>
              <label className="block text-sm">Shop ID</label>
              <input className="border p-2 w-full" value={activateForm.shopId} onChange={(e) => setActivateForm({ ...activateForm, shopId: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm">Plan Slug</label>
              <input className="border p-2 w-full" value={activateForm.planSlug} onChange={(e) => setActivateForm({ ...activateForm, planSlug: e.target.value })} />
            </div>
            <div>
              <button className="px-3 py-1 bg-orange-600 text-white rounded">Activate</button>
            </div>
            {activateMsg && <div className="text-sm">{activateMsg}</div>}
          </form>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm">Slug</label>
            <input className="border p-2 w-full" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Name</label>
            <input className="border p-2 w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <input className="border p-2 w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Interval</label>
            <select className="border p-2" value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })}>
              <option value="MONTH">MONTH</option>
              <option value="6MONTH">6MONTH</option>
              <option value="YEAR">YEAR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Price (in smallest unit)</label>
            <input className="border p-2 w-full" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Features (JSON)</label>
            <textarea className="border p-2 w-full" rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Create Plan</button>
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>

      <h2 className="text-xl font-medium mb-2">Available Plans</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-3">
          {plans.map((p) => (
            <div key={p.id} className="border p-3 rounded">
              <div className="font-semibold">{p.name} — {p.slug}</div>
              <div className="text-sm text-gray-600">{p.description}</div>
              <div className="text-sm">Interval: {p.interval} • Price: {p.price}</div>
              <div className="text-xs text-gray-700">Features: {JSON.stringify(p.features)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
