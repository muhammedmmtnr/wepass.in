'use client';

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Leaf,
  Check,
  X,
} from 'lucide-react';

export default function MenuManagementPage() {
  const [restaurantId, setRestaurantId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [unassignedItems, setUnassignedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New item modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isVegan, setIsVegan] = useState(false);
  const [isGf, setIsGf] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        let restId = authData?.user?.currentRestaurant?.id;

        if (!restId) {
          const restRes = await fetch('/api/restaurants/by-slug/olive-bistro');
          const restData = await restRes.json();
          restId = restData?.restaurant?.id;
        }

        if (restId) {
          setRestaurantId(restId);
          const res = await fetch(`/api/restaurants/${restId}/menu`);
          const data = await res.json();
          if (data.success) {
            setCategories(data.categories || []);
            setUnassignedItems(data.unassignedItems || []);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName.trim(),
          price: parseFloat(itemPrice),
          description: itemDesc.trim(),
          categoryId: categoryId || null,
          isVegetarian: isVeg,
          isVegan,
          isGlutenFree: isGf,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsItemModalOpen(false);
        setItemName('');
        setItemPrice('');
        setItemDesc('');
        // Refresh
        const refreshRes = await fetch(`/api/restaurants/${restaurantId}/menu`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setCategories(refreshData.categories);
        }
      }
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    try {
      const nextAvailable = !item.isAvailable;
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextAvailable }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.map((i: any) =>
              i.id === item.id ? { ...i, isAvailable: nextAvailable } : i
            ),
          }))
        );
      }
    } catch (e) {}
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.filter((i: any) => i.id !== itemId),
          }))
        );
      }
    } catch (e) {}
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Digital Menu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Display your dishes and drinks to guests while they track their queue status.
          </p>
        </div>

        <button
          onClick={() => setIsItemModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-wepass-700 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Menu Item
        </button>
      </div>

      {/* Categories & Items List */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">{cat.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items && cat.items.length > 0 ? (
                cat.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-2xl border border-slate-100 p-3.5 hover:bg-slate-50/70 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                        {item.isVegetarian && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Veg
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      <p className="text-xs font-black text-wepass-700 font-mono mt-2">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No dishes in this category yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Menu Item</h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Fettuccine"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="495"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients and culinary style..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-wepass-600"
                  />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                    className="rounded text-wepass-600"
                  />
                  <span>Vegan</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-wepass-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-wepass-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
