import { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, startOfWeek as startOfWeekFns, endOfWeek, addDays, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon, Check, MapPin, Users, CreditCard, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

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

const EVENT_TYPES = [
    { id: 'departures', label: 'Departures', color: 'bg-blue-500', textClass: 'text-blue-500' },
    { id: 'returns', label: 'Returns', color: 'bg-emerald-500', textClass: 'text-emerald-500' },
    { id: 'balance', label: 'Balance Due', color: 'bg-rose-500', textClass: 'text-rose-500' },
    { id: 'visa', label: 'Visa Deadlines', color: 'bg-amber-500', textClass: 'text-amber-500' },
];

export default function CalendarPage() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState(isMobile ? Views.AGENDA : Views.MONTH);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map(t => t.id));
    const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
        start: startOfWeek(startOfMonth(new Date())),
        end: endOfWeek(endOfMonth(new Date()))
    });

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const fetchEvents = async (start: Date, end: Date, types: string[]) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('start', format(start, 'yyyy-MM-dd'));
            params.append('end', format(end, 'yyyy-MM-dd'));
            types.forEach(t => params.append('types[]', t));

            const response = await axios.get(`/admin/calendar/events?${params.toString()}`);
            
            const formattedEvents = response.data.map((e: any) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.start), // Assuming all day events for now
            }));
            
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when range or types change
    useEffect(() => {
        fetchEvents(dateRange.start, dateRange.end, selectedTypes);
    }, [dateRange.start, dateRange.end, selectedTypes]);

    // Update range when navigating
    const handleNavigate = (newDate: Date, view: string) => {
        setCurrentDate(newDate);
        let start, end;
        
        if (view === Views.MONTH) {
            start = startOfWeek(startOfMonth(newDate));
            end = endOfWeek(endOfMonth(newDate));
        } else if (view === Views.WEEK) {
            start = startOfWeekFns(newDate);
            end = endOfWeek(newDate);
        } else if (view === Views.DAY) {
            start = newDate;
            end = newDate;
        } else if (view === Views.AGENDA) {
            start = newDate;
            end = addDays(newDate, 30); // Agenda usually shows next 30 days
        } else {
            start = newDate;
            end = newDate;
        }

        setDateRange({ start, end });
    };

    const handleViewChange = (newView: any) => {
        setCurrentView(newView);
        handleNavigate(currentDate, newView);
    };

    const toggleType = (typeId: string) => {
        setSelectedTypes(prev => 
            prev.includes(typeId) 
                ? prev.filter(t => t !== typeId)
                : [...prev, typeId]
        );
    };

    const eventStyleGetter = (event: any) => {
        const typeConf = EVENT_TYPES.find(t => t.id === event.type);
        
        // Define colors based on type
        let backgroundColor = '#3b82f6'; // blue-500
        if (event.type === 'returns') backgroundColor = '#10b981'; // emerald-500
        if (event.type === 'balance') backgroundColor = '#f43f5e'; // rose-500
        if (event.type === 'visa') backgroundColor = '#f59e0b'; // amber-500

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setIsSheetOpen(true);
    };

    // Custom Event Component with Tooltip
    const CustomEvent = ({ event }: any) => (
        <TooltipProvider delay={300}>
            <Tooltip>
                <TooltipTrigger>
                    <div className="text-xs truncate px-1 w-full text-left cursor-default">
                        {event.title}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                    <div className="font-semibold mb-1">{event.title}</div>
                    {event.booking && (
                        <>
                            <div>Ref: {event.booking.reference}</div>
                            <div>Dest: {event.booking.destination}</div>
                            <div>Pax: {event.booking.travelers}</div>
                        </>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    // Quick counter for departures this week
    const departuresThisWeek = useMemo(() => {
        const start = startOfWeekFns(new Date());
        const end = endOfWeek(new Date());
        return events.filter(e => e.type === 'departures' && e.start >= start && e.start <= end).length;
    }, [events]);

    // Custom Toolbar
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };
        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };
        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        const label = () => {
            const date = toolbar.date;
            if (toolbar.view === 'month') {
                return format(date, 'MMMM yyyy');
            }
            if (toolbar.view === 'week') {
                return `${format(startOfWeekFns(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d')}`;
            }
            if (toolbar.view === 'day') {
                return format(date, 'EEEE, MMM d');
            }
            if (toolbar.view === 'agenda') {
                return `${format(date, 'MMM d')} - ${format(addDays(date, 30), 'MMM d')}`;
            }
            return format(date, 'MMMM yyyy');
        };

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToBack}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={goToCurrent}>Today</Button>
                    <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
                    
                    <h2 className="text-lg font-semibold ml-2 w-48 text-center sm:text-left">{label()}</h2>
                    
                    <Popover>
                        <PopoverTrigger>
                            <Button variant="ghost" size="icon" type="button" tabIndex={-1}>
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <UICalendar
                                mode="single"
                                selected={toolbar.date}
                                onSelect={(date) => date && toolbar.onNavigate('DATE', date)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <Button 
                        variant={toolbar.view === 'month' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => toolbar.onView('month')}
                        className="h-7 text-xs"
                    >
                        Month
                    </Button>
                    <Button 
                        variant={toolbar.view === 'week' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => toolbar.onView('week')}
                        className="h-7 text-xs"
                    >
                        Week
                    </Button>
                    <Button 
                        variant={toolbar.view === 'agenda' ? 'default' : 'ghost'} 
                        size="sm" 
                        onClick={() => toolbar.onView('agenda')}
                        className="h-7 text-xs"
                    >
                        List
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <AppLayout title="Calendar">
            <Head title="Calendar" />

            <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calendar & Departures</h1>
                        <p className="text-sm text-muted-foreground">Manage your agency's schedule and deadlines.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Departures this week: <strong className="text-base ml-1">{departuresThisWeek}</strong></span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full min-h-0">
                    {/* Filters Sidebar */}
                    <Card className="lg:w-64 shrink-0 h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Check className="h-4 w-4" /> Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {EVENT_TYPES.map(type => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`type-${type.id}`} 
                                            checked={selectedTypes.includes(type.id)}
                                            onCheckedChange={() => toggleType(type.id)}
                                        />
                                        <Label 
                                            htmlFor={`type-${type.id}`}
                                            className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer"
                                        >
                                            <div className={`w-3 h-3 rounded-full ${type.color}`} />
                                            {type.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar Container */}
                    <Card className="flex-1 flex flex-col min-h-0 h-full">
                        <CardContent className="flex-1 p-4 min-h-0 relative">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}
                            <div className="h-full relative z-0 global-calendar-styles">
                                <style dangerouslySetInnerHTML={{__html:`
                                    .rbc-calendar { font-family: inherit; }
                                    .rbc-event { padding: 2px 4px; border-radius: 4px; }
                                    .rbc-today { background-color: hsl(var(--muted) / 0.5); }
                                    .rbc-off-range-bg { background-color: transparent; opacity: 0.5; }
                                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: hsl(var(--border)); border-radius: var(--radius); }
                                    .rbc-header { border-bottom: 1px solid hsl(var(--border)); padding: 8px 0; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
                                    .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
                                    .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header { border-left: 1px solid hsl(var(--border)); }
                                    .rbc-agenda-view table.rbc-agenda-table { border: 0; }
                                    .rbc-agenda-view table.rbc-agenda-table thead > tr > th { padding: 12px; border-bottom: 1px solid hsl(var(--border)); text-align: left; }
                                    .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { padding: 12px; border-top: 1px solid hsl(var(--border)); }
                                `}} />
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
                                        event: CustomEvent,
                                        toolbar: CustomToolbar
                                    }}
                                    popup
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
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={cn(
                                        "px-2 py-1 text-xs font-semibold rounded-md text-white",
                                        EVENT_TYPES.find(t => t.id === selectedEvent.type)?.color
                                    )}>
                                        {EVENT_TYPES.find(t => t.id === selectedEvent.type)?.label}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
                                    </span>
                                </div>
                                <SheetTitle className="text-xl">{selectedEvent.title}</SheetTitle>
                            </SheetHeader>
                            
                            {selectedEvent.booking ? (
                                <div className="space-y-6">
                                    <div className="grid gap-4 bg-muted/30 p-4 rounded-lg border">
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Booking Ref</div>
                                                <div className="font-medium">{selectedEvent.booking.reference}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Customer</div>
                                                <div className="font-medium">{selectedEvent.booking.customer}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Destination</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {selectedEvent.booking.destination}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">Travelers</div>
                                                <div className="font-medium flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {selectedEvent.booking.travelers} Pax
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedEvent.booking.balance > 0 && (
                                        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                            <div className="flex items-center gap-2 font-medium">
                                                <CreditCard className="h-5 w-5" />
                                                Outstanding Balance
                                            </div>
                                            <div className="text-lg font-bold">
                                                Rs. {Number(selectedEvent.booking.balance).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <Link href={`/bookings/${selectedEvent.booking.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                            Open Booking <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        This is a system event not directly linked to a specific booking action that can be opened here.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>

        </AppLayout>
    );
}
