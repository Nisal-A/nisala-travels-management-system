import { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import {
    format,
    parse,
    startOfWeek,
    getDay,
    startOfMonth,
    endOfMonth,
    startOfWeek as startOfWeekFns,
    endOfWeek,
    addDays,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Calendar as CalendarIcon,
    Check,
    MapPin,
    Users,
    CreditCard,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Plane,
    AlertTriangle,
} from 'lucide-react';
// UI Components
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from '@/components/ui/skeleton';

// ────────────────────────────────────────────────────────────────────────────
// Localizer Setup
// ────────────────────────────────────────────────────────────────────────────

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// ────────────────────────────────────────────────────────────────────────────
// Event Type Configuration
// ────────────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
    { id: 'departures', label: 'Departures', color: 'bg-blue-500', textClass: 'text-blue-500', hex: '#3b82f6' },
    { id: 'returns', label: 'Returns', color: 'bg-emerald-500', textClass: 'text-emerald-500', hex: '#10b981' },
    { id: 'balance', label: 'Balance Due', color: 'bg-rose-500', textClass: 'text-rose-500', hex: '#f43f5e' },
    { id: 'visa', label: 'Visa Deadlines', color: 'bg-amber-500', textClass: 'text-amber-500', hex: '#f59e0b' },
] as const;

type EventType = (typeof EVENT_TYPES)[number]['id'];

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: EventType;
    booking_id: number | null;
    status: string;
    booking: {
        id: number;
        customer: string;
        destination: string;
        travelers: number;
        balance: number;
        reference: string;
        status: string;
    } | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Calendar Styles
// ────────────────────────────────────────────────────────────────────────────

const calendarStyles = `
    .rbc-calendar { font-family: inherit; }
    .rbc-event { padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
    .rbc-event:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 1px; }
    .rbc-today { background-color: color-mix(in srgb, var(--color-primary) 6%, transparent) !important; }
    .rbc-off-range-bg { background-color: transparent; opacity: 0.4; }
    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: hsl(var(--border)); border-radius: var(--radius); overflow: hidden; }
    .rbc-header { border-bottom: 1px solid hsl(var(--border)); padding: 10px 0; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; color: hsl(var(--muted-foreground)); }
    .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
    .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header { border-left: 1px solid hsl(var(--border)); }
    .rbc-date-cell { font-size: 0.8rem; padding: 4px 8px; }
    .rbc-date-cell.rbc-now { font-weight: 700; color: var(--color-primary); }
    .rbc-agenda-view table.rbc-agenda-table { border: 0; }
    .rbc-agenda-view table.rbc-agenda-table thead > tr > th { padding: 12px 16px; border-bottom: 1px solid hsl(var(--border)); text-align: left; font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; color: hsl(var(--muted-foreground)); }
    .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { padding: 10px 16px; border-top: 1px solid hsl(var(--border) / 0.5); }
    .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover > td { background-color: hsl(var(--muted) / 0.5); }
    .rbc-show-more { color: var(--color-primary); font-weight: 600; font-size: 0.7rem; }
    .rbc-overlay { border-radius: var(--radius); border: 1px solid hsl(var(--border)); background: hsl(var(--background)); box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15); }
    .rbc-overlay-header { border-bottom: 1px solid hsl(var(--border)); padding: 8px 12px; font-weight: 600; }
`;

// ────────────────────────────────────────────────────────────────────────────
// Calendar Loading Skeleton
// ────────────────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-16 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-6 w-40 ml-2" />
                </div>
                <Skeleton className="h-9 w-48 rounded-lg" />
            </div>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={`h-${i}`} className="h-8 rounded-none" />
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={`c-${i}`} className="h-20 rounded-none" />
                ))}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Status Badge
// ────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
        pending: { variant: 'secondary', label: 'Pending' },
        confirmed: { variant: 'default', label: 'Confirmed' },
        completed: { variant: 'outline', label: 'Completed' },
        cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status?.toLowerCase()] ?? { variant: 'secondary' as const, label: status };
    return (
        <Badge variant={config.variant} className="text-[0.65rem] capitalize">
            {config.label}
        </Badge>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Calendar Page
// ────────────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState(isMobile ? Views.AGENDA : Views.MONTH);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map((t) => t.id));
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
        start: startOfWeek(startOfMonth(new Date())),
        end: endOfWeek(endOfMonth(new Date())),
    });

    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Update default view when screen size changes
    useEffect(() => {
        if (isMobile && currentView === Views.MONTH) {
            setCurrentView(Views.AGENDA);
        }
    }, [isMobile]);

    const fetchEvents = useCallback(async (start: Date, end: Date, types: string[]) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('start', format(start, 'yyyy-MM-dd'));
            params.append('end', format(end, 'yyyy-MM-dd'));
            types.forEach((t) => params.append('types[]', t));

            const response = await axios.get(`/admin/calendar/events?${params.toString()}`);

            const formattedEvents: CalendarEvent[] = response.data.map((e: any) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.start),
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refetch when range or types change
    useEffect(() => {
        fetchEvents(dateRange.start, dateRange.end, selectedTypes);
    }, [dateRange.start, dateRange.end, selectedTypes, fetchEvents]);

    // Update range when navigating
    const handleNavigate = useCallback(
        (newDate: Date, view?: string) => {
            const activeView = view ?? currentView;
            setCurrentDate(newDate);
            let start: Date, end: Date;

            if (activeView === Views.MONTH) {
                start = startOfWeek(startOfMonth(newDate));
                end = endOfWeek(endOfMonth(newDate));
            } else if (activeView === Views.WEEK) {
                start = startOfWeekFns(newDate);
                end = endOfWeek(newDate);
            } else if (activeView === Views.AGENDA) {
                start = newDate;
                end = addDays(newDate, 30);
            } else {
                start = newDate;
                end = newDate;
            }

            setDateRange({ start, end });
        },
        [currentView],
    );

    const handleViewChange = useCallback(
        (newView: any) => {
            setCurrentView(newView);
            handleNavigate(currentDate, newView);
        },
        [currentDate, handleNavigate],
    );

    const toggleType = (typeId: string) => {
        setSelectedTypes((prev) => (prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]));
    };

    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const typeConf = EVENT_TYPES.find((t) => t.id === event.type);

        return {
            style: {
                backgroundColor: typeConf?.hex ?? '#3b82f6',
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsSheetOpen(true);
    }, []);

    // Custom Event Component with Tooltip (desktop only)
    const CustomEvent = useMemo(() => {
        return function EventComponent({ event }: { event: CalendarEvent }) {
            if (isMobile) {
                return <div className="text-xs truncate px-1 w-full text-left cursor-pointer">{event.title}</div>;
            }

            return (
                <TooltipProvider delay={300}>
                    <Tooltip>
                        <TooltipTrigger
                            render={<div className="text-xs truncate px-1 w-full text-left cursor-pointer" />}
                        >
                            {event.title}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100] p-3">
                            <div className="font-semibold mb-1.5">{event.title}</div>
                            {event.booking && (
                                <div className="space-y-1 text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-foreground">Ref:</span>{' '}
                                        {event.booking.reference}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" /> {event.booking.destination}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3" /> {event.booking.travelers} Pax
                                    </div>
                                    {event.booking.balance > 0 && (
                                        <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                                            <CreditCard className="h-3 w-3" /> Rs.{' '}
                                            {Number(event.booking.balance).toLocaleString()} due
                                        </div>
                                    )}
                                </div>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        };
    }, [isMobile]);

    // Quick counter for departures this week
    const departuresThisWeek = useMemo(() => {
        const start = startOfWeekFns(new Date());
        const end = endOfWeek(new Date());
        return events.filter((e) => e.type === 'departures' && e.start >= start && e.start <= end).length;
    }, [events]);

    // Event counts by type
    const eventCounts = useMemo(() => {
        return EVENT_TYPES.reduce(
            (acc, type) => {
                acc[type.id] = events.filter((e) => e.type === type.id).length;
                return acc;
            },
            {} as Record<string, number>,
        );
    }, [events]);

    // Custom Toolbar
    const CustomToolbar = useCallback((toolbar: any) => {
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const goToCurrent = () => toolbar.onNavigate('TODAY');

        const label = () => {
            const date = toolbar.date;
            if (toolbar.view === 'month') return format(date, 'MMMM yyyy');
            if (toolbar.view === 'week')
                return `${format(startOfWeekFns(date), 'MMM d')} – ${format(endOfWeek(date), 'MMM d, yyyy')}`;
            if (toolbar.view === 'day') return format(date, 'EEEE, MMMM d');
            if (toolbar.view === 'agenda')
                return `${format(date, 'MMM d')} – ${format(addDays(date, 30), 'MMM d, yyyy')}`;
            return format(date, 'MMMM yyyy');
        };

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToBack} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToCurrent} className="h-8 text-xs font-medium">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <h2 className="text-base font-semibold ml-2 min-w-[10rem] text-center sm:text-left">{label()}</h2>

                    <Popover>
                        <PopoverTrigger
                            render={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <CalendarIcon className="h-4 w-4" />
                                </Button>
                            }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                            <UICalendar
                                mode="single"
                                selected={toolbar.date}
                                onSelect={(date: Date | undefined) => date && toolbar.onNavigate('DATE', date)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    {[
                        { view: 'month', label: 'Month' },
                        { view: 'week', label: 'Week' },
                        { view: 'agenda', label: 'List' },
                    ].map(({ view, label }) => (
                        <Button
                            key={view}
                            variant={toolbar.view === view ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => toolbar.onView(view)}
                            className="h-7 text-xs font-medium"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }, []);

    return (
        <AppLayout title="Calendar">
            <Head title="Calendar & Departures" />

            <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calendar & Departures</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage your agency's schedule, departures, and deadlines.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
                        <Plane className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            Departures this week: <strong className="text-base ml-0.5">{departuresThisWeek}</strong>
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full min-h-0">
                    {/* Filters Sidebar */}
                    <Card className="lg:w-64 shrink-0 h-fit border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Event Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {EVENT_TYPES.map((type) => (
                                    <div key={type.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${type.id}`}
                                                checked={selectedTypes.includes(type.id)}
                                                onCheckedChange={(checked: boolean) => toggleType(type.id)}
                                            />
                                            <Label
                                                htmlFor={`type-${type.id}`}
                                                className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                                            >
                                                <div className={`w-2.5 h-2.5 rounded-full ${type.color}`} />
                                                {type.label}
                                            </Label>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="text-[0.6rem] h-5 min-w-[1.5rem] justify-center"
                                        >
                                            {eventCounts[type.id] ?? 0}
                                        </Badge>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="pt-3 border-t border-border/60">
                                <p className="text-xs text-muted-foreground mb-2 font-medium">Legend</p>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {EVENT_TYPES.map((type) => (
                                        <div key={type.id} className="flex items-center gap-2">
                                            <div className={`w-3 h-1.5 rounded-full ${type.color}`} />
                                            <span className="text-xs text-muted-foreground">{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar Container */}
                    <Card className="flex-1 flex flex-col min-h-0 h-full border-border/60">
                        <CardContent className="flex-1 p-4 min-h-0 relative">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-background/60 flex items-center justify-center backdrop-blur-[2px] rounded-lg">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                        <span className="text-xs text-muted-foreground font-medium">
                                            Loading events…
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="h-full relative z-0">
                                <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: '100%' }}
                                    views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                                    view={currentView}
                                    onView={handleViewChange}
                                    date={currentDate}
                                    onNavigate={handleNavigate}
                                    eventPropGetter={eventStyleGetter}
                                    onSelectEvent={handleSelectEvent}
                                    components={{
                                        event: CustomEvent as any,
                                        toolbar: CustomToolbar,
                                    }}
                                    popup
                                    length={30}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event Side Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    {selectedEvent && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <div
                                        className={cn(
                                            'px-2.5 py-1 text-xs font-semibold rounded-md text-white',
                                            EVENT_TYPES.find((t) => t.id === selectedEvent.type)?.color,
                                        )}
                                    >
                                        {EVENT_TYPES.find((t) => t.id === selectedEvent.type)?.label}
                                    </div>
                                    {selectedEvent.status && <StatusBadge status={selectedEvent.status} />}
                                    <span className="text-sm text-muted-foreground">
                                        {format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
                                    </span>
                                </div>
                                <SheetTitle className="text-xl">{selectedEvent.title}</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Details for calendar event: {selectedEvent.title}
                                </SheetDescription>
                            </SheetHeader>

                            {selectedEvent.booking ? (
                                <div className="space-y-6">
                                    <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border border-border/60">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                                    Booking Ref
                                                </div>
                                                <div className="font-semibold text-sm">
                                                    {selectedEvent.booking.reference}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                                    Customer
                                                </div>
                                                <div className="font-semibold text-sm">
                                                    {selectedEvent.booking.customer}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                                    Destination
                                                </div>
                                                <div className="font-semibold text-sm flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {selectedEvent.booking.destination}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1 font-medium">
                                                    Travelers
                                                </div>
                                                <div className="font-semibold text-sm flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {selectedEvent.booking.travelers} Pax
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedEvent.booking.balance > 0 && (
                                        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                            <div className="flex items-center gap-2 font-medium">
                                                <AlertTriangle className="h-5 w-5" />
                                                Outstanding Balance
                                            </div>
                                            <div className="text-lg font-bold">
                                                Rs. {Number(selectedEvent.booking.balance).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <Link
                                            href={`/bookings/${selectedEvent.booking.id}`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                        >
                                            Open Booking <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                                        <CalendarIcon className="h-10 w-10 opacity-30 mb-3" />
                                        <p className="text-sm font-medium">System Event</p>
                                        <p className="text-xs mt-1">This event is not directly linked to a booking.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
