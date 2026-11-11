'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Users,
  Eye,
  RefreshCw,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useDashboardRestaurant } from '@/components/DashboardRestaurantContext';

export default function QRManagementPage() {
  const currentRestaurant = useDashboardRestaurant();
  const restaurantId = currentRestaurant.id;
  const [qrData, setQrData] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadQR() {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`/api/restaurants/${restaurantId}/qr`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Unable to load restaurant QR details.');
        }
        setQrData(data.qr);
        setRestaurant(data.restaurant);
      } catch (error) {
        console.error('Restaurant QR request failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load restaurant QR details.');
      } finally {
        setLoading(false);
      }
    }
    loadQR();
  }, [restaurantId]);

  const handleCopyLink = () => {
    if (!qrData?.permanentUrl) return;
    navigator.clipboard.writeText(qrData.permanentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrData?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `${restaurant?.slug || 'wepass'}-permanent-qr.png`;
    a.click();
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl p-4 py-10 md:p-8">
        <p role="alert" className="rounded-2xl border border-rose-200 bg-white p-5 text-sm text-rose-800">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Restaurant QR Kit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Permanent, reusable static QR code for {restaurant?.name}. Display at your entrance host stand.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={handlePrintCard}
            className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-wepass-700 transition"
          >
            <Printer className="h-4 w-4" /> Print Stand Card
          </button>
        </div>
      </div>

      {/* QR Analytics 3-Box Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Scans</p>
            <p className="text-2xl font-black text-slate-900">{qrData?.totalScans ?? '—'}</p>
            <span className="text-[10px] text-slate-400 font-medium">Guest phone camera scans</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Eye className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Joins</p>
            <p className="text-2xl font-black text-slate-900">{qrData?.totalJoins ?? '—'}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Parties entered queue</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Conversion Rate</p>
            <p className="text-2xl font-black text-slate-900">
              {qrData?.conversionRate == null ? '—' : `${qrData.conversionRate}%`}
            </p>
            <span className="text-[10px] text-amber-700 font-medium">Scan to join ratio</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Printable Stand Layout Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Printable Stand Card Preview */}
        <div
          id="printable-stand"
          className="rounded-4xl flex min-h-[540px] flex-col items-center justify-between border-2 border-wepass-200/80 bg-gradient-to-b from-[#E8F3EC] to-white p-4 text-center shadow-premium sm:p-8 md:p-10"
        >
          {/* Brand header */}
          <div className="space-y-1">
            <BrandLogo size="md" />
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase mt-1">
              Smart Restaurant Waitlist
            </p>
          </div>

          {/* Restaurant identity */}
          <div className="my-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {restaurant?.name ?? currentRestaurant.name}
            </h2>
            <p className="text-xs text-wepass-700 font-medium mt-0.5">
              Scan to join waitlist & track your table live
            </p>
          </div>

          {/* Clean Vector QR Card */}
          <div className="relative inline-block max-w-full rounded-3xl border border-slate-100 bg-white p-3 shadow-float sm:p-5">
            {qrData?.qrDataUrl ? (
              <Image
                src={qrData.qrDataUrl}
                alt="WePass QR Code"
                width={256}
                height={256}
                unoptimized
                sizes="(max-width: 480px) 56vw, (max-width: 1023px) 224px, 256px"
                className="h-[min(56vw,14rem)] w-[min(56vw,14rem)] rounded-xl object-contain sm:h-56 sm:w-56 md:h-64 md:w-64"
              />
            ) : (
              <div className="h-[min(56vw,14rem)] w-[min(56vw,14rem)] animate-pulse rounded-xl bg-slate-100 sm:h-56 sm:w-56 md:h-64 md:w-64" />
            )}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-black text-wepass-700 uppercase tracking-widest font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SCAN &amp; JOIN
            </div>
          </div>

          {/* Simple 3 Step Instructions */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-left w-full max-w-sm">
            <div className="rounded-xl bg-white/80 p-2.5 border border-wepass-100">
              <span className="text-[10px] font-black text-wepass-600 block">STEP 1</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Scan Camera</p>
            </div>
            <div className="rounded-xl bg-white/80 p-2.5 border border-wepass-100">
              <span className="text-[10px] font-black text-wepass-600 block">STEP 2</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Enter Party</p>
            </div>
            <div className="rounded-xl bg-white/80 p-2.5 border border-wepass-100">
              <span className="text-[10px] font-black text-wepass-600 block">STEP 3</span>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Track Live</p>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 mt-3">
            No app download required • Works on all smartphones
          </div>
        </div>

        {/* QR Details and Management Tools */}
        <div className="space-y-6">
          {/* Permanent URL details */}
          <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Permanent Guest URL</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every registered restaurant receives one permanent, reusable public URL. All guests scan this static QR code.
            </p>

            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-2">
              <input
                type="text"
                readOnly
                value={qrData?.permanentUrl || ''}
                className="w-full bg-transparent px-2 text-xs font-mono font-medium text-slate-700 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm shrink-0 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={qrData?.permanentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-wepass-600 hover:text-wepass-700"
              >
                Preview Guest Page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* QR Integrity & Policy */}
          <div className="rounded-3xl bg-wepass-50/70 p-6 border border-wepass-200/80 space-y-3">
            <div className="flex items-center gap-2 text-wepass-800 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-wepass-600" />
              <span>WePass Static QR Policy</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike dynamic session QR codes that expire and cause guest confusion, WePass static codes never change. You can print physical acrylic standees, stickers, and table tent cards once and use them indefinitely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
