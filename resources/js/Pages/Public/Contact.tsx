import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Phone, Mail, ChevronRight, CheckCircle2, AlertCircle, Compass, Calendar, ArrowRight } from 'lucide-react';
import { site as company } from '@/content/site';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const formSchema = z.object({
    tripInterestType: z.enum(['tour', 'destination']),
    tour_package_id: z.string().optional(),
    destination_interest: z.string().optional(),
    tripTypeChips: z.array(z.string()).default([]),

    preferred_travel_month: z.string().min(1, "Please select dates or a month"),
    flexibleDates: z.boolean().default(false),
    adults: z.number().min(1, "At least 1 adult is required"),
    children: z.number().min(0),
    budget: z.string().optional(),

    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5, "Phone number is required"),
    preferredContactMethod: z.enum(['WhatsApp', 'Phone', 'Email']).default('WhatsApp'),
    message: z.string().max(2000).optional(),
    consent: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
    website_field: z.string().optional(),
    form_start_time: z.number().optional()
}).refine(data => {
    if (data.tripInterestType === 'tour' && !data.tour_package_id) return false;
    if (data.tripInterestType === 'destination' && !data.destination_interest) return false;
    return true;
}, {
    message: "Please select a tour or enter a destination",
    path: ['destination_interest']
});

type FormData = z.output<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

const STEPS = ['Trip Interest', 'Dates & Travelers', 'Contact Details'];
const TRIP_TYPES = ['Family', 'Honeymoon', 'Group', 'Solo', 'Business', 'Adventure'];

export default function Contact() {
    const { url } = usePage();
    const queryParams = new URLSearchParams(window.location.search);
    const initialTourSlug = queryParams.get('tour');

    const [currentStep, setCurrentStep] = useState(0);
    const [tours, setTours] = useState<any[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const savedData = typeof window !== 'undefined' ? sessionStorage.getItem('contactFormData') : null;
    const defaultValues: Partial<FormInput> = savedData ? JSON.parse(savedData) : {
        tripInterestType: initialTourSlug ? 'tour' : 'destination',
        tripTypeChips: [],
        flexibleDates: false,
        adults: 2,
        children: 0,
        preferredContactMethod: 'WhatsApp',
        consent: false,
        form_start_time: Date.now()
    };

    const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    const formData = watch();

    useEffect(() => {
        axios.get('/api/public/tours', { params: { per_page: 100 } }).then(res => {
            setTours(res.data.data);
            if (initialTourSlug) {
                const matched = res.data.data.find((t: any) => t.slug === initialTourSlug || t.id.toString() === initialTourSlug);
                if (matched) {
                    setValue('tour_package_id', matched.id.toString());
                    setValue('tripInterestType', 'tour');
                }
            }
        });
    }, [initialTourSlug, setValue]);

    useEffect(() => {
        if (!isSuccess && typeof window !== 'undefined') {
            sessionStorage.setItem('contactFormData', JSON.stringify(formData));
        }
    }, [formData, isSuccess]);

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (currentStep === 0) {
            fieldsToValidate = ['tripInterestType', 'tour_package_id', 'destination_interest'];
        } else if (currentStep === 1) {
            fieldsToValidate = ['preferred_travel_month', 'adults', 'children'];
        }

        const isStepValid = await trigger(fieldsToValidate as any);
        if (isStepValid) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const onSubmit = async (data: FormData) => {
        setServerError(null);

        let fullMessage = "";
        if (data.tripTypeChips?.length) fullMessage += `Trip Types: ${data.tripTypeChips.join(', ')}\n`;
        fullMessage += `Flexible Dates: ${data.flexibleDates ? 'Yes' : 'No'}\n`;
        fullMessage += `Adults: ${data.adults}, Children: ${data.children}\n`;
        if (data.budget) fullMessage += `Budget: ${data.budget}\n`;
        fullMessage += `Preferred Contact: ${data.preferredContactMethod}\n\n`;
        fullMessage += `Message:\n${data.message || 'No additional message.'}`;

        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            tour_package_id: data.tripInterestType === 'tour' ? data.tour_package_id : null,
            destination_interest: data.tripInterestType === 'destination' ? data.destination_interest : null,
            preferred_travel_month: data.preferred_travel_month,
            number_of_travelers: data.adults + data.children,
            message: fullMessage,
            consent: data.consent,
            website_field: data.website_field
        };

        try {
            await axios.post('/api/public/inquiries', payload);
            setIsSuccess(true);
            sessionStorage.removeItem('contactFormData');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            if (error.response?.status === 429) {
                setServerError("Too many inquiries from this email address. Please try again later.");
            } else {
                setServerError(error.response?.data?.message || "An error occurred while submitting your inquiry. Please try again.");
            }
        }
    };

    const toggleTripType = (type: string) => {
        const current = formData.tripTypeChips || [];
        if (current.includes(type)) {
            setValue('tripTypeChips', current.filter(t => t !== type));
        } else {
            setValue('tripTypeChips', [...current, type]);
        }
    };

    if (isSuccess) {
        return (
            <PublicLayout>
                <Head title="Thank You | Nisala Travels" />
                <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-neutral-900">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-[2rem] shadow-2xl text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-sm border border-green-200">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black text-neutral-900 mb-6 relative z-10">Journey Initiated.</h1>
                        <p className="text-xl text-neutral-600 mb-10 max-w-lg mx-auto relative z-10 font-light">We've received your request. Our travel artisans are crafting your itinerary and will reach out shortly.</p>

                        <div className="bg-neutral-50 rounded-2xl p-8 mb-10 text-left border border-neutral-100 relative z-10 shadow-inner">
                            <h3 className="font-bold text-neutral-900 mb-6 uppercase tracking-widest text-xs">Request Summary</h3>
                            <ul className="space-y-4 text-neutral-600">
                                <li className="flex items-center gap-3"><span className="w-24 font-semibold text-neutral-900 text-sm">Traveler</span> {formData.name}</li>
                                <li className="flex items-center gap-3"><span className="w-24 font-semibold text-neutral-900 text-sm">Contact</span> {formData.email}</li>
                                <li className="flex items-center gap-3"><span className="w-24 font-semibold text-neutral-900 text-sm">Timeline</span> {formData.preferred_travel_month} for {formData.adults + formData.children} explorers</li>
                            </ul>
                        </div>

                        <div className="flex justify-center relative z-10">
                            <Button render={<Link href="/tours" />} size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-lg">
                                Discover More Escapes
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title="Contact Us | Nisala Travels" />

            <div className="bg-neutral-900 pt-32 pb-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                </div>
                <div className="container mx-auto text-center text-white relative z-10 pt-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-xl"
                    >
                        Design Your Journey
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto font-light"
                    >
                        Connect with our travel artisans to weave the perfect itinerary tailored to your rhythm.
                    </motion.p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Form Column */}
                    <div className="flex-1 max-w-3xl">
                        {/* Elegant Progress Indicator */}
                        <div className="mb-12 flex items-center justify-between relative px-2">
                            <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-neutral-200 -z-10 rounded-full" />
                            <div className="absolute left-0 top-1/2 h-[2px] bg-primary transition-all duration-700 ease-in-out -z-10 rounded-full" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

                            {STEPS.map((step, index) => (
                                <div key={step} className="flex flex-col items-center group">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-all duration-500 ${currentStep >= index ? 'bg-primary text-white shadow-[0_0_20px_rgba(201,162,39,0.4)] scale-110' : 'bg-white text-neutral-400 border-2 border-neutral-200'}`}>
                                        {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <span className={`text-xs font-bold tracking-widest uppercase hidden sm:block transition-colors ${currentStep >= index ? 'text-neutral-900' : 'text-neutral-400'}`}>{step}</span>
                                </div>
                            ))}
                        </div>

                        {serverError && (
                            <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 text-red-800 shadow-sm">
                                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
                                <p className="font-medium">{serverError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-neutral-100 relative overflow-hidden">
                            <input type="text" {...register('website_field')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                            <input type="hidden" {...register('form_start_time')} />

                            <AnimatePresence mode="wait">
                                {/* Step 1: Trip Interest */}
                                {currentStep === 0 && (
                                    <motion.div 
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-10"
                                    >
                                        <div>
                                            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-3">Where to?</h2>
                                            <p className="text-neutral-500 font-light text-lg">Choose a predefined package or dream up your own destination.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className={`flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.tripInterestType === 'tour' ? 'border-primary bg-primary/5 shadow-md' : 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'}`}>
                                                <div className="flex items-center mb-2">
                                                    <input type="radio" value="tour" {...register('tripInterestType')} className="text-primary focus:ring-primary w-5 h-5 mr-3" />
                                                    <span className="font-bold text-neutral-900 text-lg">Curated Package</span>
                                                </div>
                                                <span className="text-sm text-neutral-500 pl-8 font-light">I have a specific Nisala Travels tour in mind.</span>
                                            </label>
                                            <label className={`flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${formData.tripInterestType === 'destination' ? 'border-primary bg-primary/5 shadow-md' : 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'}`}>
                                                <div className="flex items-center mb-2">
                                                    <input type="radio" value="destination" {...register('tripInterestType')} className="text-primary focus:ring-primary w-5 h-5 mr-3" />
                                                    <span className="font-bold text-neutral-900 text-lg">Custom Destination</span>
                                                </div>
                                                <span className="text-sm text-neutral-500 pl-8 font-light">I want to explore a specific location my way.</span>
                                            </label>
                                        </div>

                                        {formData.tripInterestType === 'tour' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Select Package</label>
                                                <div className="relative">
                                                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <select {...register('tour_package_id')} className="w-full h-14 rounded-xl border-2 border-neutral-100 focus:ring-primary focus:border-primary bg-neutral-50 pl-12 pr-4 transition-colors font-medium">
                                                        <option value="">-- Discover our collections --</option>
                                                        {tours.map(t => (
                                                            <option key={t.id} value={t.id}>{t.package_name} ({t.destination})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </motion.div>
                                        )}

                                        {formData.tripInterestType === 'destination' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Where do you want to go?</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <Input {...register('destination_interest')} placeholder="e.g. Kyoto, Japan or The Maldives..." className="h-14 rounded-xl border-2 border-neutral-100 bg-neutral-50 pl-12 transition-colors focus-visible:bg-white text-base" />
                                                </div>
                                            </motion.div>
                                        )}
                                        {errors.destination_interest && <p className="text-red-500 text-sm font-medium">{errors.destination_interest.message}</p>}

                                        <div>
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Pace & Style (Optional)</label>
                                            <div className="flex flex-wrap gap-3">
                                                {TRIP_TYPES.map(type => {
                                                    const isSelected = formData.tripTypeChips?.includes(type);
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => toggleTripType(type)}
                                                            className={`px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all duration-300 ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Dates & Travelers */}
                                {currentStep === 1 && (
                                    <motion.div 
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-10"
                                    >
                                        <div>
                                            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-3">Timeline & Company</h2>
                                            <p className="text-neutral-500 font-light text-lg">Help us understand when and with whom you'll be traveling.</p>
                                        </div>

                                        <div className="space-y-4 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                                            <div>
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Anticipated Travel Dates <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                                    <Input {...register('preferred_travel_month')} placeholder="e.g. Nov 2026 or Dec 15 - Dec 28" className="h-14 rounded-xl border-none shadow-sm pl-12 text-base font-medium" />
                                                </div>
                                                {errors.preferred_travel_month && <p className="text-red-500 text-sm mt-2 font-medium">{errors.preferred_travel_month.message}</p>}
                                            </div>
                                            <label className="flex items-center cursor-pointer pt-2 group">
                                                <input type="checkbox" {...register('flexibleDates')} className="w-5 h-5 rounded text-primary focus:ring-primary border-neutral-300 mr-3" />
                                                <span className="text-neutral-600 font-medium group-hover:text-neutral-900 transition-colors">My dates are flexible (± a few days)</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="bg-white p-6 rounded-2xl border-2 border-neutral-100 flex flex-col gap-4">
                                                <div>
                                                    <div className="font-bold text-neutral-900 text-lg">Adults</div>
                                                    <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">12+ years</div>
                                                </div>
                                                <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                                                    <button type="button" onClick={() => setValue('adults', Math.max(1, formData.adults - 1))} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-600 hover:text-primary transition-colors">-</button>
                                                    <span className="font-black text-2xl text-neutral-900 w-12 text-center">{formData.adults}</span>
                                                    <button type="button" onClick={() => setValue('adults', formData.adults + 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-600 hover:text-primary transition-colors">+</button>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-2xl border-2 border-neutral-100 flex flex-col gap-4">
                                                <div>
                                                    <div className="font-bold text-neutral-900 text-lg">Children</div>
                                                    <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Under 12</div>
                                                </div>
                                                <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                                                    <button type="button" onClick={() => setValue('children', Math.max(0, formData.children - 1))} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-600 hover:text-primary transition-colors">-</button>
                                                    <span className="font-black text-2xl text-neutral-900 w-12 text-center">{formData.children}</span>
                                                    <button type="button" onClick={() => setValue('children', formData.children + 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-neutral-600 hover:text-primary transition-colors">+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Estimated Budget / Person (Optional)</label>
                                            <select {...register('budget')} className="w-full h-14 rounded-xl border-2 border-neutral-100 focus:ring-primary focus:border-primary bg-neutral-50 px-4 transition-colors font-medium">
                                                <option value="">Exploring options</option>
                                                <option value="Under $1,500">Under $1,500</option>
                                                <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                                                <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                                                <option value="$5,000+">$5,000+</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Contact Details */}
                                {currentStep === 2 && (
                                    <motion.div 
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-8"
                                    >
                                        <div>
                                            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-3">Final Details</h2>
                                            <p className="text-neutral-500 font-light text-lg">How should our concierges reach you with your itinerary?</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
                                            <Input {...register('name')} placeholder="Your legal name" className="h-14 rounded-xl border-2 border-neutral-100 bg-neutral-50 focus-visible:bg-white transition-colors text-base font-medium" />
                                            {errors.name && <p className="text-red-500 text-sm font-medium">{errors.name.message}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Email Address <span className="text-red-500">*</span></label>
                                                <Input type="email" {...register('email')} placeholder="you@example.com" className="h-14 rounded-xl border-2 border-neutral-100 bg-neutral-50 focus-visible:bg-white transition-colors text-base font-medium" />
                                                {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></label>
                                                <Input type="tel" {...register('phone')} placeholder="Include country code" className="h-14 rounded-xl border-2 border-neutral-100 bg-neutral-50 focus-visible:bg-white transition-colors text-base font-medium" />
                                                {errors.phone && <p className="text-red-500 text-sm font-medium">{errors.phone.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Preferred Contact Method</label>
                                            <div className="flex flex-wrap gap-4">
                                                {['WhatsApp', 'Email', 'Phone'].map(method => (
                                                    <label key={method} className={`flex-1 flex items-center justify-center cursor-pointer p-4 rounded-xl border-2 transition-all font-bold ${formData.preferredContactMethod === method ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-200'}`}>
                                                        <input type="radio" value={method} {...register('preferredContactMethod')} className="hidden" />
                                                        {method}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Additional Notes</label>
                                                <span className="text-xs text-neutral-400 font-medium bg-neutral-100 px-2 py-1 rounded-md">{formData.message?.length || 0} / 2000</span>
                                            </div>
                                            <textarea {...register('message')} rows={4} className="w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 focus:ring-primary focus:border-primary focus:bg-white p-4 resize-none transition-colors text-base" placeholder="Tell us about special occasions, dietary requirements, or specific landmarks you must see..."></textarea>
                                        </div>

                                        <div className="pt-6 border-t border-neutral-100">
                                            <label className="flex items-start cursor-pointer group p-4 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-primary/30 transition-colors">
                                                <input type="checkbox" {...register('consent')} className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary border-neutral-300 mr-4 flex-shrink-0" />
                                                <span className="text-sm text-neutral-600 leading-relaxed font-medium">
                                                    I agree to the <Link href="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link> and consent to Nisala Travels contacting me regarding this request.
                                                </span>
                                            </label>
                                            {errors.consent && <p className="text-red-500 text-sm mt-2 ml-4 font-medium">{errors.consent.message}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="mt-12 flex items-center justify-between pt-8 border-t border-neutral-100">
                                {currentStep > 0 ? (
                                    <button type="button" onClick={handleBack} className="text-neutral-500 hover:text-neutral-900 font-bold uppercase tracking-widest text-sm transition-colors">
                                        Back
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < STEPS.length - 1 ? (
                                    <Button type="button" size="lg" className="rounded-full px-10 h-14 text-lg shadow-lg group" onClick={handleNext}>
                                        Continue <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button type="submit" size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-2xl hover:-translate-y-1 transition-all" disabled={isSubmitting}>
                                        {isSubmitting ? 'Finalizing...' : 'Submit Request'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Contact Info */}
                    <div className="lg:w-[400px]">
                        <div className="bg-neutral-900 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden sticky top-32">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            
                            <h3 className="text-3xl font-serif font-bold mb-8 relative z-10">Reach Out</h3>

                            <div className="space-y-8 relative z-10 mb-12">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0"><MapPin className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Headquarters</h4>
                                        <p className="text-white/70 text-sm leading-relaxed">{company.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0"><Phone className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Direct Line</h4>
                                        <p className="text-white/70 text-lg"><a href={`tel:${company.phone}`} className="hover:text-primary transition-colors">{company.phone}</a></p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-primary shrink-0"><Mail className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2 uppercase tracking-widest text-xs">Email Concierge</h4>
                                        <p className="text-white/70"><a href={`mailto:${company.email}`} className="hover:text-primary transition-colors">{company.email}</a></p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 bg-white/5 rounded-2xl p-6 border border-white/10">
                                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Availability</h4>
                                <ul className="space-y-3 text-sm text-white/70">
                                    <li className="flex justify-between items-center"><span className="font-medium">Mon - Fri</span> <span>09:00 - 18:00</span></li>
                                    <li className="flex justify-between items-center"><span className="font-medium">Saturday</span> <span>09:00 - 13:00</span></li>
                                    <li className="flex justify-between items-center"><span className="font-medium">Sunday</span> <span>Closed</span></li>
                                </ul>
                                <p className="text-xs text-white/40 mt-5 pt-4 border-t border-white/10">GMT+5:30 (Sri Lanka Standard Time)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
