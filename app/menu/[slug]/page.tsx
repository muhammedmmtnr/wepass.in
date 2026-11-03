'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Utensils, Leaf, Award, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function DigitalMenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/by-slug/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setRestaurant(data.restaurant);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8F3EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Menu not found.</p>
        <Link href={`/r/${slug}`} className="mt-4 inline-block text-xs font-bold text-wepass-600">
          Back to Restaurant
        </Link>
      </div>
    );
  }

  const categories = restaurant.menuCategories || [];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 pb-16">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link
            href={`/r/${slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Waitlist
          </Link>
          <span className="font-extrabold text-slate-900 text-sm truncate max-w-[200px]">
            {restaurant.name}
          </span>
          <span className="text-[10px] font-bold text-wepass-700 bg-wepass-100 px-2 py-0.5 rounded-full">
            Digital Menu
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-wepass-700 to-wepass-600 p-5 text-white shadow-premium mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
            {restaurant.category || 'Casual Dining'}
          </span>
          <h1 className="text-xl font-black mt-0.5">{restaurant.name}</h1>
          <p className="text-xs text-wepass-100 mt-1">
            Order directly with your server when your table is seated.
          </p>
        </div>

        {/* Categories Tab Pill Scroll */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shrink-0 transition ${
                activeCategory === 'all'
                  ? 'bg-wepass-600 text-white shadow'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Items
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shrink-0 transition ${
                  activeCategory === cat.id
                    ? 'bg-wepass-600 text-white shadow'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items List */}
        <div className="space-y-6">
          {categories
            .filter((cat: any) => activeCategory === 'all' || activeCategory === cat.id)
            .map((cat: any) => (
              <div key={cat.id}>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-1">
                  {cat.name}
                </h3>
                <div className="space-y-3">
                  {cat.items && cat.items.length > 0 ? (
                    cat.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-20 w-20 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {item.name}
                              </h4>
                              <span className="text-sm font-extrabold text-wepass-700 shrink-0 font-mono">
                                ₹{item.price}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {item.isVegetarian && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Leaf className="h-3 w-3" /> Veg
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                                Vegan
                              </span>
                            )}
                            {item.isGlutenFree && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Gluten-Free
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic px-2">No items in this section.</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
