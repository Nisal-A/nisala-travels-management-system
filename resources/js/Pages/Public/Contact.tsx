import { SEOHead } from '@/components/public/SEOHead';
import { useState, useEffect } from 'react';
import {  Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/components/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Calendar, Users, Phone, Mail, MessageCircle, Clock, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { site as company } from '@/content/site';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import axios from 'axios';

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
    const [destinations, setDestinations] = useState<any[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Initialize form with sessionStorage or defaults
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

    const { register, handleSubmit, setError, control, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormData>({
        resolver: zodResolver(formSchema),
        defaultValues
    });

    const formData = watch();

    useEffect(() => {
        // Fetch tours and destinations for dropdown
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
        axios.get('/api/public/destinations').then(res => {
            setDestinations(res.data.data || res.data); // handles both paginated and direct array formats
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

        // Format payload to match server expectations
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
            website_field: data.website_field // honeypot
        };

        try {
            await axios.post('/inquiries', payload);
            setIsSuccess(true);
            sessionStorage.removeItem('contactFormData');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            if (error.response?.status === 429) {
                setServerError("Too many inquiries from this email address. Please try again later.");
            } else if (error.response?.status === 422 && error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                Object.keys(serverErrors).forEach((field) => {
                    // @ts-ignore
                    setError(field as keyof FormInput, {
                        type: 'server',
                        message: serverErrors[field][0],
                    });
                });
                setServerError("Please correct the errors in the form.");
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
                <SEOHead title="Thank You" description="Thank you for inquiring with Nisala Travels. We will get back to you soon." url="/contact" />
                <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-neutral-50">
                    <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center border border-neutral-100">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl font-black text-neutral-900 mb-4">Thank You!</h1>
                        <p className="text-xl text-neutral-600 mb-8 max-w-lg mx-auto">We've received your inquiry and our travel experts will contact you within 24 hours.</p>

                        <div className="bg-neutral-50 rounded-2xl p-6 mb-8 text-left border border-neutral-100">
                            <h3 className="font-bold text-neutral-900 mb-4">Inquiry Summary</h3>
                            <ul className="space-y-3 text-neutral-600 text-sm">
                                <li className="flex gap-2"><strong>Name:</strong> {formData.name}</li>
                                <li className="flex gap-2"><strong>Email:</strong> {formData.email}</li>
                                <li className="flex gap-2"><strong>Contact:</strong> {formData.phone} ({formData.preferredContactMethod})</li>
                                <li className="flex gap-2"><strong>Travel:</strong> {formData.preferred_travel_month} for {formData.adults + formData.children} people</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button render={<Link href="/tours" />} size="lg" className="rounded-full px-8">Browse more tours</Button>
                            <WhatsAppButton variant="button" label="Chat on WhatsApp" text="Hi, I just submitted an inquiry on your website!" />
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <SEOHead title="Contact Us" description="Get in touch with Nisala Travels to plan your next dream vacation to Thailand, India or beyond." url="/contact" />

            <div className="bg-neutral-900 pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="container mx-auto text-center text-white relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Your Journey</h1>
                    <p className="text-lg text-neutral-300">Tell us what you're looking for, and we'll craft the perfect itinerary.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Form Column */}
                    <div className="flex-1 max-w-3xl">
                        {/* Progress Indicator */}
                        <div className="mb-10 flex items-center justify-between relative">
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-200 -z-10" />
                            <div className="absolute left-0 top-1/2 h-0.5 bg-primary transition-all duration-300 -z-10" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

                            {STEPS.map((step, index) => (
                                <div key={step} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${currentStep >= index ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-400 border-2 border-neutral-200'}`}>
                                        {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <span className={`text-xs font-semibold hidden sm:block ${currentStep >= index ? 'text-neutral-900' : 'text-neutral-400'}`}>{step}</span>
                                </div>
                            ))}
                        </div>

                        {serverError && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>{serverError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-neutral-100 relative">
                            {/* Honeypot */}
                            <input type="text" {...register('website_field')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                            <input type="hidden" {...register('form_start_time')} />

                            {/* Step 1: Trip Interest */}
                            <div className={`${currentStep === 0 ? 'block' : 'hidden'} space-y-8 animate-in fade-in slide-in-from-right-4 duration-500`}>
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">What kind of trip are you looking for?</h2>
                                    <p className="text-neutral-500 mb-6">Select a pre-designed package or tell us where you want to go.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${formData.tripInterestType === 'tour' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                        <input type="radio" value="tour" {...register('tripInterestType')} className="text-primary focus:ring-primary w-5 h-5 mr-3" />
                                        <span className="font-bold">I know the tour package</span>
                                    </label>
                                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${formData.tripInterestType === 'destination' ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                        <input type="radio" value="destination" {...register('tripInterestType')} className="text-primary focus:ring-primary w-5 h-5 mr-3" />
                                        <span className="font-bold">I have a destination in mind</span>
                                    </label>
                                </div>

                                {formData.tripInterestType === 'tour' && (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95">
                                        <label htmlFor="tour_package_id" className="block font-semibold text-neutral-700">Select Tour Package</label>
                                        <select id="tour_package_id" {...register('tour_package_id')} aria-invalid={!!errors.tour_package_id} aria-describedby="tour_package_error" className="w-full h-12 rounded-xl border-neutral-300 focus:ring-primary focus:border-primary bg-white px-4">
                                            <option value="">-- Choose a package --</option>
                                            {tours.map(t => (
                                                <option key={t.id} value={t.id}>{t.package_name} ({t.destination})</option>
                                            ))}
                                        </select>
                                        {errors.tour_package_id && <p id="tour_package_error" className="text-red-500 text-sm">{errors.tour_package_id.message}</p>}
                                    </div>
                                )}

                                {formData.tripInterestType === 'destination' && (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95">
                                        <label htmlFor="destination_interest" className="block font-semibold text-neutral-700">Destination Interest</label>
                                        <select id="destination_interest" {...register('destination_interest')} aria-invalid={!!errors.destination_interest} aria-describedby="destination_error" className="w-full h-12 rounded-xl border-neutral-300 focus:ring-primary focus:border-primary bg-white px-4">
                                            <option value="">-- Choose a destination --</option>
                                            {destinations.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        {errors.destination_interest && <p id="destination_error" className="text-red-500 text-sm">{errors.destination_interest.message}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block font-semibold text-neutral-700 mb-3">Trip Style (Optional)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {TRIP_TYPES.map(type => {
                                            const isSelected = formData.tripTypeChips?.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => toggleTripType(type)}
                                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'}`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Dates & Travelers */}
                            <div className={`${currentStep === 1 ? 'block' : 'hidden'} space-y-8 animate-in fade-in slide-in-from-right-4 duration-500`}>
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">When and who is traveling?</h2>
                                    <p className="text-neutral-500 mb-6">Let us know your availability and group size.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="preferred_travel_month" className="block font-semibold text-neutral-700 mb-2">Preferred Travel Month / Dates <span className="text-red-500">*</span></label>
                                        <Input id="preferred_travel_month" {...register('preferred_travel_month')} placeholder="e.g. November 2026 or Nov 10 - Nov 20" className="h-12 rounded-xl" aria-invalid={!!errors.preferred_travel_month} aria-describedby="travel_month_error" />
                                        {errors.preferred_travel_month && <p id="travel_month_error" className="text-red-500 text-sm mt-1">{errors.preferred_travel_month.message}</p>}
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('flexibleDates')} className="w-5 h-5 rounded text-primary focus:ring-primary border-neutral-300 mr-3" />
                                        <span className="text-neutral-700">My dates are flexible</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-neutral-900">Adults</div>
                                            <div className="text-xs text-neutral-500">12+ years</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => setValue('adults', Math.max(1, formData.adults - 1))} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100">-</button>
                                            <span className="font-bold text-lg w-4 text-center">{formData.adults}</span>
                                            <button type="button" onClick={() => setValue('adults', formData.adults + 1)} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-neutral-900">Children</div>
                                            <div className="text-xs text-neutral-500">Under 12 years</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => setValue('children', Math.max(0, formData.children - 1))} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100">-</button>
                                            <span className="font-bold text-lg w-4 text-center">{formData.children}</span>
                                            <button type="button" onClick={() => setValue('children', formData.children + 1)} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-600 hover:bg-neutral-100">+</button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-neutral-700 mb-2">Approximate Budget (Optional)</label>
                                    <select {...register('budget')} className="w-full h-12 rounded-xl border-neutral-300 focus:ring-primary focus:border-primary bg-white px-4">
                                        <option value="">Not sure yet</option>
                                        <option value="Under $1,500 per person">Under $1,500 per person</option>
                                        <option value="$1,500 - $3,000 per person">$1,500 - $3,000 per person</option>
                                        <option value="$3,000 - $5,000 per person">$3,000 - $5,000 per person</option>
                                        <option value="$5,000+ per person">$5,000+ per person</option>
                                    </select>
                                </div>
                            </div>

                            {/* Step 3: Contact Details */}
                            <div className={`${currentStep === 2 ? 'block' : 'hidden'} space-y-6 animate-in fade-in slide-in-from-right-4 duration-500`}>
                                <div>
                                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Contact Details</h2>
                                    <p className="text-neutral-500 mb-6">How can we reach you with your custom itinerary?</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="name" className="block font-semibold text-neutral-700">Full Name <span className="text-red-500">*</span></label>
                                    <Input id="name" {...register('name')} placeholder="John Doe" className="h-12 rounded-xl" aria-invalid={!!errors.name} aria-describedby="name_error" />
                                    {errors.name && <p id="name_error" className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block font-semibold text-neutral-700">Email Address <span className="text-red-500">*</span></label>
                                        <Input id="email" type="email" {...register('email')} placeholder="john@example.com" className="h-12 rounded-xl" aria-invalid={!!errors.email} aria-describedby="email_error" />
                                        {errors.email && <p id="email_error" className="text-red-500 text-sm">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="block font-semibold text-neutral-700">Phone Number <span className="text-red-500">*</span></label>
                                        <Input id="phone" type="tel" {...register('phone')} placeholder="+94 77 123 4567" className="h-12 rounded-xl" aria-invalid={!!errors.phone} aria-describedby="phone_error" />
                                        {errors.phone && <p id="phone_error" className="text-red-500 text-sm">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-semibold text-neutral-700">Preferred Contact Method</label>
                                    <div className="flex gap-4">
                                        {['WhatsApp', 'Email', 'Phone'].map(method => (
                                            <label key={method} className="flex items-center cursor-pointer">
                                                <input type="radio" value={method} {...register('preferredContactMethod')} className="text-primary focus:ring-primary w-4 h-4 mr-2" />
                                                <span className="text-neutral-700">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label htmlFor="message" className="block font-semibold text-neutral-700">Additional Message</label>
                                        <span className="text-xs text-neutral-400">{formData.message?.length || 0}/2000</span>
                                    </div>
                                    <textarea id="message" {...register('message')} rows={4} className="w-full rounded-xl border-neutral-300 focus:ring-primary focus:border-primary p-4 resize-none" placeholder="Any special requirements, dietary needs, or places you must see..." aria-invalid={!!errors.message} aria-describedby={errors.message ? "message_error" : undefined}></textarea>
                                    {errors.message && <p id="message_error" className="text-red-500 text-sm">{errors.message.message}</p>}
                                </div>

                                <div className="pt-4 border-t border-neutral-100">
                                    <label htmlFor="consent" className="flex items-start cursor-pointer group">
                                        <input id="consent" type="checkbox" {...register('consent')} aria-invalid={!!errors.consent} aria-describedby="consent_error" className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary border-neutral-300 mr-3 flex-shrink-0" />
                                        <span className="text-sm text-neutral-600 leading-relaxed group-hover:text-neutral-900 transition-colors">
                                            I agree to the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and consent to Nisala Travels contacting me regarding this inquiry.
                                        </span>
                                    </label>
                                    {errors.consent && <p id="consent_error" className="text-red-500 text-sm mt-2 ml-8">{errors.consent.message}</p>}
                                </div>

                                <div className="bg-neutral-50 p-4 rounded-xl text-sm text-neutral-600 mt-4 border border-neutral-200">
                                    <strong>Summary:</strong> You are requesting a {formData.tripInterestType === 'tour' ? 'tour package' : 'custom trip'} for {formData.adults + formData.children} people in {formData.preferred_travel_month || '[Dates]'}.
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="mt-10 flex items-center justify-between pt-6 border-t border-neutral-100">
                                {currentStep > 0 ? (
                                    <Button type="button" variant="outline" size="lg" className="rounded-full px-8" onClick={handleBack}>
                                        Back
                                    </Button>
                                ) : (
                                    <div /> // Placeholder for flex spacing
                                )}

                                {currentStep < STEPS.length - 1 ? (
                                    <Button type="button" size="lg" className="rounded-full px-8 shadow-md" onClick={handleNext}>
                                        Continue <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" size="lg" className="rounded-full px-10 shadow-lg font-bold" disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Contact Info */}
                    <div className="lg:w-96 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><MapPin className="w-32 h-32 text-neutral-900" /></div>

                            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h3>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><MapPin className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 mb-1">Head Office</h4>
                                        <p className="text-neutral-600 text-sm leading-relaxed">{company.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Phone className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 mb-1">Call Us</h4>
                                        <p className="text-neutral-600 text-sm"><a href={`tel:${company.phone}`} className="hover:text-primary transition-colors">{company.phone}</a></p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Mail className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 mb-1">Email</h4>
                                        <p className="text-neutral-600 text-sm"><a href={`mailto:${company.email}`} className="hover:text-primary transition-colors">{company.email}</a></p>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-8 border-neutral-100" />

                            <div>
                                <h4 className="font-bold text-neutral-900 mb-4">Business Hours</h4>
                                <ul className="space-y-2 text-sm text-neutral-600">
                                    <li className="flex justify-between"><span>Monday - Friday:</span> <span>9:00 AM - 6:00 PM</span></li>
                                    <li className="flex justify-between"><span>Saturday:</span> <span>9:00 AM - 1:00 PM</span></li>
                                    <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
                                </ul>
                                <p className="text-xs text-neutral-400 mt-4">* Times are in Sri Lanka Standard Time (GMT+5:30)</p>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-neutral-200 rounded-3xl h-64 overflow-hidden relative shadow-inner border border-neutral-300 group">
                            {/* In a real app, this would be an iframe or Google Map component */}
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" alt="Map Location" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg font-bold text-neutral-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" /> View on Map
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
