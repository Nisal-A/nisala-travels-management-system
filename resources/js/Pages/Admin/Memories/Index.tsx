import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';

export interface MemoryMediaItem {
  id: number;
  memory_year_id: number;
  type: 'image' | 'video';
  file_path: string | null;
  external_url: string | null;
  poster_path: string | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  url?: string;
}

export interface MemoryYearRecord {
  id: number;
  year: number;
  title: string;
  summary: string | null;
  destination_id: number | null;
  tour_name: string | null;
  consent_confirmed_at: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  destination?: {
    id: number;
    country: string;
    city_region: string;
  } | null;
  media?: MemoryMediaItem[];
}

interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

interface IndexProps {
  years: PaginatedData<MemoryYearRecord>;
}

export default function MemoriesIndex({ years }: IndexProps) {
  const records = years?.data ?? [];
  const publishedCount = records.filter((y) => y.is_published).length;
  const totalMediaCount = records.reduce((acc, y) => acc + (y.media?.length || 0), 0);

  const handleTogglePublish = (id: number) => {
    router.patch(route('admin.memories.toggle-publish', id), {}, {
      preserveScroll: true,
    });
  };

  const handleDelete = (id: number, year: number) => {
    if (confirm(`Are you sure you want to delete memories for year ${year}? This cannot be undone.`)) {
      router.delete(route('admin.memories.destroy', id), {
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout
      title="Traveler Memories"
      breadcrumbs={[
        { label: 'Admin', href: route('admin.dashboard') },
        { label: 'Memories' },
      ]}
    >
      <Head title="Traveler Memories Management - Admin" />

      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#052351] dark:text-slate-100">
              Traveler Memories
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Curate annual traveler stories, verified consent memories, photography, and showcase films.
            </p>
          </div>
          <Link
            href={route('admin.memories.create')}
            className={buttonVariants({
              className: 'bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-semibold shadow-sm hover:shadow transition-all rounded-[12px] px-5 py-2.5 h-auto text-sm inline-flex items-center',
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Memory Year
          </Link>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Years Archived
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-[#052351] dark:text-white">
                {years?.total ?? records.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Cataloged expedition years</p>
            </CardContent>
          </Card>

          <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Published & Live
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                {publishedCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Visible on public journey portal</p>
            </CardContent>
          </Card>

          <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Media Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-[#052351] dark:text-white">
                {totalMediaCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Photos & video links attached</p>
            </CardContent>
          </Card>
        </div>

        {/* Memories Table Card */}
        <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
            <CardTitle className="text-base font-semibold text-[#052351] dark:text-slate-100">
              Archived Journey Years
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {records.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Camera className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-3 text-lg font-medium text-slate-900 dark:text-slate-100">
                  No memory years yet
                </h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                  Get started by creating your first expedition memory year and attaching traveler photography.
                </p>
                <div className="mt-6">
                  <Link
                    href={route('admin.memories.create')}
                    className={buttonVariants({
                      className: 'bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-semibold rounded-[12px] inline-flex items-center',
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Memory Year
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-3.5">Year</th>
                      <th className="px-6 py-3.5">Title & Tour</th>
                      <th className="px-6 py-3.5">Destination</th>
                      <th className="px-6 py-3.5">Media Assets</th>
                      <th className="px-6 py-3.5">Consent Status</th>
                      <th className="px-6 py-3.5">Publish Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {records.map((item) => {
                      const imageCount = item.media?.filter((m) => m.type === 'image').length || 0;
                      const videoCount = item.media?.filter((m) => m.type === 'video').length || 0;
                      const hasConsent = Boolean(item.consent_confirmed_at);
                      const hasMedia = (item.media?.length || 0) > 0;
                      const canBePublished = hasConsent && hasMedia;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-serif text-lg font-bold text-[#052351] dark:text-slate-100 whitespace-nowrap">
                            {item.year}
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </div>
                            {item.tour_name && (
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                Tour: {item.tour_name}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {item.destination
                              ? `${item.destination.city_region}, ${item.destination.country}`
                              : 'All Regions'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center text-slate-600 dark:text-slate-300">
                                <ImageIcon className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                {imageCount}/10 photos
                              </span>
                              <span className="flex items-center text-slate-600 dark:text-slate-300">
                                <Video className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                {videoCount}/2 videos
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasConsent ? (
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 gap-1 font-normal">
                                <CheckCircle2 className="h-3 w-3" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 gap-1 font-normal">
                                <AlertCircle className="h-3 w-3" />
                                Missing Consent
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.is_published ? (
                              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-slate-600 dark:text-slate-400">
                                Draft
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant={item.is_published ? 'outline' : 'default'}
                                className={
                                  item.is_published
                                    ? 'h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200'
                                    : 'h-8 px-2.5 text-xs bg-[#052351] hover:bg-[#026E9F] text-white'
                                }
                                onClick={() => handleTogglePublish(item.id)}
                                title={
                                  !item.is_published && !canBePublished
                                    ? 'Requires verified consent and at least one media item'
                                    : undefined
                                }
                              >
                                {item.is_published ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Globe className="h-3.5 w-3.5 mr-1" />
                                    Publish
                                  </>
                                )}
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 cursor-pointer' })}>
                                  <MoreVertical className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    onClick={() => router.visit(route('admin.memories.edit', item.id))}
                                    className="cursor-pointer"
                                  >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit & Media
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(item.id, item.year)}
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Year
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {years && years.last_page > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="text-xs text-slate-500">
                  Showing page {years.current_page} of {years.last_page} ({years.total} total items)
                </div>
                <div className="flex items-center gap-2">
                  {years.prev_page_url && (
                    <Link
                      href={years.prev_page_url}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Previous
                    </Link>
                  )}
                  {years.next_page_url && (
                    <Link
                      href={years.next_page_url}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
