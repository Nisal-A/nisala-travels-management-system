import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';

interface DestinationOption {
  id: number;
  country: string;
  city_region: string;
}

interface CreateProps {
  destinations: DestinationOption[];
}

export default function MemoriesCreate({ destinations }: CreateProps) {
  const currentYear = new Date().getFullYear();

  const { data, setData, post, processing, errors } = useForm({
    year: currentYear,
    title: '',
    summary: '',
    destination_id: '',
    tour_name: '',
    consent_confirmed_at: '',
    sort_order: 0,
  });

  const [confirmConsentNow, setConfirmConsentNow] = useState(false);

  const handleConsentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConfirmConsentNow(checked);
    if (checked) {
      setData('consent_confirmed_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
    } else {
      setData('consent_confirmed_at', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.memories.store'));
  };

  return (
    <AppLayout
      title="Add Memory Year"
      breadcrumbs={[
        { label: 'Admin', href: route('admin.dashboard') },
        { label: 'Memories', href: route('admin.memories.index') },
        { label: 'Add Year' },
      ]}
    >
      <Head title="Add Memory Year - Admin" />

      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <Link
            href={route('admin.memories.index')}
            className={buttonVariants({ variant: 'outline', size: 'icon', className: 'rounded-xl h-9 w-9 inline-flex items-center justify-center' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#052351] dark:text-slate-100">
              Create Memory Year
            </h1>
            <p className="text-slate-500 text-xs">
              Archive annual expeditions and prepare media curation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <CardTitle className="text-base font-semibold text-[#052351] dark:text-slate-100">
                Year Details & Consent
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Set basic identification, expedition summary, and traveler privacy consent.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Expedition Year <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    min={1900}
                    max={2100}
                    value={data.year}
                    onChange={(e) => setData('year', parseInt(e.target.value, 10) || 0)}
                    className="rounded-xl"
                    required
                  />
                  {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Display Sort Order
                  </Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 0)}
                    className="rounded-xl"
                  />
                  {errors.sort_order && <p className="text-xs text-red-500">{errors.sort_order}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Annual Title / Headline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Sacred Summits & Southern Lagoons"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="rounded-xl"
                  required
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Expedition Summary
                </Label>
                <Textarea
                  id="summary"
                  rows={4}
                  placeholder="Describe the key moments, highlights, and journey reflections..."
                  value={data.summary}
                  onChange={(e) => setData('summary', e.target.value)}
                  className="rounded-xl"
                />
                {errors.summary && <p className="text-xs text-red-500">{errors.summary}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="destination_id" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Primary Destination
                  </Label>
                  <select
                    id="destination_id"
                    value={data.destination_id}
                    onChange={(e) => setData('destination_id', e.target.value)}
                    className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- No specific destination --</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city_region}, {d.country}
                      </option>
                    ))}
                  </select>
                  {errors.destination_id && <p className="text-xs text-red-500">{errors.destination_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tour_name" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Tour Name (Optional)
                  </Label>
                  <Input
                    id="tour_name"
                    placeholder="e.g. Ceylon Grandeur Expedition"
                    value={data.tour_name}
                    onChange={(e) => setData('tour_name', e.target.value)}
                    className="rounded-xl"
                  />
                  {errors.tour_name && <p className="text-xs text-red-500">{errors.tour_name}</p>}
                </div>
              </div>

              {/* Consent Section */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Traveler Consent Verification
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                      Publishing requires written or digital consent confirmed from participating guests. You can verify this now or later before publishing.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="confirm_consent"
                    type="checkbox"
                    checked={confirmConsentNow}
                    onChange={handleConsentToggle}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="confirm_consent" className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                    Confirm that guest consent has been verified for this year
                  </label>
                </div>

                {data.consent_confirmed_at && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 pl-6">
                    Timestamp recorded: {data.consent_confirmed_at}
                  </p>
                )}
                {errors.consent_confirmed_at && (
                  <p className="text-xs text-red-500 pl-6">{errors.consent_confirmed_at}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Link
                  href={route('admin.memories.index')}
                  className={buttonVariants({ variant: 'outline', className: 'rounded-xl' })}
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-semibold rounded-xl px-5"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? 'Creating...' : 'Create & Continue to Media'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
