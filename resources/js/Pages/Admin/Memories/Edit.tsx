import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Video,
  Image as ImageIcon,
  Trash2,
  Globe,
  EyeOff,
  Save,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { MemoryMediaItem, MemoryYearRecord } from './Index';

interface DestinationOption {
  id: number;
  country: string;
  city_region: string;
}

interface EditProps {
  memoryYear: MemoryYearRecord;
  destinations: DestinationOption[];
  canPublish: boolean;
}

export default function MemoriesEdit({ memoryYear, destinations, canPublish }: EditProps) {
  // Year update form
  const { data, setData, put, processing, errors } = useForm({
    year: memoryYear.year,
    title: memoryYear.title,
    summary: memoryYear.summary || '',
    destination_id: memoryYear.destination_id ? String(memoryYear.destination_id) : '',
    tour_name: memoryYear.tour_name || '',
    consent_confirmed_at: memoryYear.consent_confirmed_at || '',
    sort_order: memoryYear.sort_order || 0,
  });

  // Image upload form
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video addition form
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const mediaList = memoryYear.media || [];
  const imageCount = mediaList.filter((m) => m.type === 'image').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.memories.update', memoryYear.id), {
      preserveScroll: true,
    });
  };

  const handleTogglePublish = () => {
    router.patch(route('admin.memories.toggle-publish', memoryYear.id), {}, {
      preserveScroll: true,
    });
  };

  const handleImageUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setImageError(null);

    if (!imageFile) {
      setImageError('Please select an image file to upload.');
      return;
    }
    if (!imageAltText.trim()) {
      setImageError('Alt text is required for images.');
      return;
    }

    const formData = new FormData();
    formData.append('type', 'image');
    formData.append('image', imageFile);
    formData.append('alt_text', imageAltText.trim());
    if (imageCaption.trim()) {
      formData.append('caption', imageCaption.trim());
    }

    setImageProcessing(true);
    router.post(route('admin.memories.media.store', memoryYear.id), formData, {
      preserveScroll: true,
      onSuccess: () => {
        setImageFile(null);
        setImageAltText('');
        setImageCaption('');
        setImageProcessing(false);
      },
      onError: (err) => {
        const errorRecord = err as Record<string, string>;
        setImageError(errorRecord.image || errorRecord.alt_text || Object.values(errorRecord)[0] || 'Image upload failed.');
        setImageProcessing(false);
      },
    });
  };

  const handleVideoAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError(null);

    if (!videoUrl.trim()) {
      setVideoError('Please enter a valid video URL.');
      return;
    }

    setVideoProcessing(true);
    router.post(
      route('admin.memories.media.store', memoryYear.id),
      {
        type: 'video',
        external_url: videoUrl.trim(),
        caption: videoCaption.trim() || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setVideoUrl('');
          setVideoCaption('');
          setVideoProcessing(false);
        },
        onError: (err) => {
          const errorRecord = err as Record<string, string>;
          setVideoError(errorRecord.video || errorRecord.external_url || Object.values(errorRecord)[0] || 'Failed to add video.');
          setVideoProcessing(false);
        },
      }
    );
  };

  const handleDeleteMedia = (mediaId: number) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      router.delete(route('admin.memories.media.destroy', [memoryYear.id, mediaId]), {
        preserveScroll: true,
      });
    }
  };

  const handleConsentToggle = (checked: boolean) => {
    if (checked) {
      setData('consent_confirmed_at', new Date().toISOString().slice(0, 19).replace('T', ' '));
    } else {
      setData('consent_confirmed_at', '');
    }
  };

  return (
    <AppLayout
      title={`Edit Memory Year ${memoryYear.year}`}
      breadcrumbs={[
        { label: 'Admin', href: route('admin.dashboard') },
        { label: 'Memories', href: route('admin.memories.index') },
        { label: `Year ${memoryYear.year}` },
      ]}
    >
      <Head title={`Edit Year ${memoryYear.year} - Memories`} />

      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <Link
              href={route('admin.memories.index')}
              className={buttonVariants({ variant: 'outline', size: 'icon', className: 'rounded-xl h-9 w-9 inline-flex items-center justify-center' })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#052351] dark:text-slate-100">
                  {memoryYear.year}: {memoryYear.title}
                </h1>
                {memoryYear.is_published ? (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Manage metadata, traveler consent, and media assets (max 10 photos, 2 videos).
              </p>
            </div>
          </div>

          {/* Quick Publish Toggle */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleTogglePublish}
              className={
                memoryYear.is_published
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl'
                  : 'bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-semibold rounded-xl shadow-sm'
              }
            >
              {memoryYear.is_published ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish Year
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Publish Year
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Publishing Requirements Banner if not published */}
        {!memoryYear.is_published && (
          <div className="rounded-[16px] border border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1 text-blue-900 dark:text-blue-200">
                <span className="font-semibold text-sm">Publishing Checklist:</span>
                <ul className="list-disc list-inside space-y-0.5 mt-1 text-slate-700 dark:text-slate-300">
                  <li className={data.consent_confirmed_at ? 'text-emerald-700 font-medium' : 'text-amber-800'}>
                    Traveler Privacy Consent: {data.consent_confirmed_at ? '✓ Confirmed' : '✗ Required before publishing'}
                  </li>
                  <li className={mediaList.length > 0 ? 'text-emerald-700 font-medium' : 'text-amber-800'}>
                    Media Items: {mediaList.length > 0 ? `✓ ${mediaList.length} attached` : '✗ At least 1 photo or video required'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Year Metadata Form */}
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={handleDetailsSubmit}>
              <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3.5">
                  <CardTitle className="text-sm font-semibold text-[#052351] dark:text-slate-100">
                    Year Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5 text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="year" className="text-xs font-semibold">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={data.year}
                      onChange={(e) => setData('year', parseInt(e.target.value, 10) || 0)}
                      className="rounded-xl h-9"
                      required
                    />
                    {errors.year && <p className="text-red-500">{errors.year}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-semibold">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      className="rounded-xl h-9"
                      required
                    />
                    {errors.title && <p className="text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="summary" className="text-xs font-semibold">
                      Summary
                    </Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={data.summary}
                      onChange={(e) => setData('summary', e.target.value)}
                      className="rounded-xl text-xs"
                    />
                    {errors.summary && <p className="text-red-500">{errors.summary}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="destination_id" className="text-xs font-semibold">
                      Destination
                    </Label>
                    <select
                      id="destination_id"
                      value={data.destination_id}
                      onChange={(e) => setData('destination_id', e.target.value)}
                      className="w-full flex h-9 rounded-xl border border-input bg-background px-3 py-1.5 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">-- No Destination --</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.city_region}, {d.country}
                        </option>
                      ))}
                    </select>
                    {errors.destination_id && <p className="text-red-500">{errors.destination_id}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tour_name" className="text-xs font-semibold">
                      Tour Name
                    </Label>
                    <Input
                      id="tour_name"
                      value={data.tour_name}
                      onChange={(e) => setData('tour_name', e.target.value)}
                      className="rounded-xl h-9"
                    />
                    {errors.tour_name && <p className="text-red-500">{errors.tour_name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sort_order" className="text-xs font-semibold">
                      Sort Order
                    </Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 0)}
                      className="rounded-xl h-9"
                    />
                    {errors.sort_order && <p className="text-red-500">{errors.sort_order}</p>}
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="consent_checkbox"
                        type="checkbox"
                        checked={Boolean(data.consent_confirmed_at)}
                        onChange={(e) => handleConsentToggle(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="consent_checkbox" className="text-xs font-medium cursor-pointer">
                        Traveler consent verified
                      </label>
                    </div>
                    {data.consent_confirmed_at && (
                      <p className="text-[11px] text-slate-500 pl-6">
                        Confirmed at: {data.consent_confirmed_at}
                      </p>
                    )}
                    {errors.consent_confirmed_at && (
                      <p className="text-red-500 pl-6">{errors.consent_confirmed_at}</p>
                    )}
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-[#052351] hover:bg-[#026E9F] text-white rounded-xl h-9 text-xs"
                    >
                      <Save className="h-3.5 w-3.5 mr-2" />
                      {processing ? 'Saving...' : 'Save Year Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Right Column: Media Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Limits & Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[16px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Expedition Photos</p>
                  <p className="text-xl font-bold font-serif text-[#052351] dark:text-slate-100">
                    {imageCount} <span className="text-xs font-normal text-slate-400">/ 10 max</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                  <ImageIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-[16px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Video Highlights</p>
                  <p className="text-xl font-bold font-serif text-[#052351] dark:text-slate-100">
                    {videoCount} <span className="text-xs font-normal text-slate-400">/ 2 max</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                  <Video className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Media Upload Forms Accordion/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Image Upload Form */}
              <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    Upload Photo (JPG, PNG, WebP)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {imageCount >= 10 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200">
                      Limit reached (10 images max). Delete an existing photo to upload a new one.
                    </div>
                  ) : (
                    <form onSubmit={handleImageUpload} className="space-y-3 text-xs">
                      {imageError && (
                        <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs">
                          {imageError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor="photo_file" className="text-xs">
                          Image File (Max 5 MB) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="photo_file"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="rounded-xl text-xs h-9"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="image_alt" className="text-xs">
                          Alt Text (Accessibility) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="image_alt"
                          placeholder="Describe the image content..."
                          value={imageAltText}
                          onChange={(e) => setImageAltText(e.target.value)}
                          className="rounded-xl text-xs h-9"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="image_caption" className="text-xs">
                          Caption (Optional)
                        </Label>
                        <Input
                          id="image_caption"
                          placeholder="e.g. Sunset over Ayutthaya Temple"
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          className="rounded-xl text-xs h-9"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={imageProcessing || !imageFile}
                        className="w-full bg-[#052351] hover:bg-[#026E9F] text-white rounded-xl h-9 text-xs mt-2"
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        {imageProcessing ? 'Processing & Converting...' : 'Upload Image'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Video URL Form */}
              <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Video className="h-4 w-4 text-amber-600" />
                    Attach Video Link (External URL)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {videoCount >= 2 ? (
                    <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200">
                      Limit reached (2 videos max). Delete an existing video link to add another.
                    </div>
                  ) : (
                    <form onSubmit={handleVideoAdd} className="space-y-3 text-xs">
                      {videoError && (
                        <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs">
                          {videoError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor="video_url" className="text-xs">
                          Video URL (YouTube/Vimeo) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="video_url"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="rounded-xl text-xs h-9"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="video_caption" className="text-xs">
                          Caption / Title (Optional)
                        </Label>
                        <Input
                          id="video_caption"
                          placeholder="e.g. Highland Expedition Highlights"
                          value={videoCaption}
                          onChange={(e) => setVideoCaption(e.target.value)}
                          className="rounded-xl text-xs h-9"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={videoProcessing || !videoUrl.trim()}
                        className="w-full bg-[#FEC822] hover:bg-[#FE950B] text-[#052351] font-semibold rounded-xl h-9 text-xs mt-2"
                      >
                        <Video className="h-3.5 w-3.5 mr-2" />
                        {videoProcessing ? 'Adding...' : 'Attach Video'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attached Media Assets Gallery */}
            <Card className="rounded-[16px] shadow-sm border border-slate-200/80 dark:border-slate-800">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 px-5 py-3.5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#052351] dark:text-slate-100">
                  Attached Media ({mediaList.length})
                </CardTitle>
                <span className="text-xs text-slate-500">
                  {imageCount}/10 Photos • {videoCount}/2 Videos
                </span>
              </CardHeader>
              <CardContent className="p-5">
                {mediaList.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs">No media attached yet. Upload photos or video links above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaList.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow"
                      >
                        <div>
                          {item.type === 'image' ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                              <img
                                src={item.url || `/storage/${item.file_path}`}
                                alt={item.alt_text || 'Expedition photo'}
                                className="h-full w-full object-cover"
                              />
                              <Badge className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                                Photo
                              </Badge>
                            </div>
                          ) : (
                            <div className="relative aspect-video w-full rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-3 text-center">
                              <Video className="h-8 w-8 text-[#FEC822]" />
                              <Badge className="absolute top-1.5 left-1.5 bg-[#FEC822] text-[#052351] text-[10px] font-bold px-1.5 py-0.5">
                                Video
                              </Badge>
                              <a
                                href={item.external_url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 text-[11px] text-blue-300 underline hover:text-white flex items-center gap-1 max-w-full truncate"
                              >
                                View Link <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}

                          <div className="mt-2 space-y-1">
                            {item.caption && (
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {item.caption}
                              </p>
                            )}
                            {item.alt_text && (
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                <span className="font-medium">Alt:</span> {item.alt_text}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t flex items-center justify-between text-xs text-slate-400">
                          <span>Order: {item.sort_order}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMedia(item.id)}
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
