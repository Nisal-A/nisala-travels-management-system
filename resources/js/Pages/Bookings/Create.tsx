import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BookingStepper from './components/BookingStepper';
import Step1Customer from './components/Step1Customer';
import Step2PackageDates from './components/Step2PackageDates';
import Step3Travelers, { TravelerRow } from './components/Step3Travelers';
import Step4Pricing, { ExtraItem } from './components/Step4Pricing';
import Step5Payment, { ScheduleItem } from './components/Step5Payment';
import Step6Review from './components/Step6Review';
import {
    step1Schema,
    step2Schema,
    step3Schema,
    step4Schema,
    step5Schema,
    WizardFormData
} from './components/wizard-schema';
import { Customer, TourPackage, Employee, Booking } from '@/types';
import axios from 'axios';
import { toast } from 'sonner';
import { Cloud, CloudCheck, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
    customers: Customer[];
    packages: TourPackage[];
    employees: Employee[];
    travelerTypes: string[];
    canDiscount?: boolean;
    existingDraft?: {
        id: number;
        step: number;
        payload: Partial<WizardFormData>;
        updated_at: string;
    } | null;
    booking?: Booking;
    isEditing?: boolean;
}

export default function Create({
    customers,
    packages,
    employees,
    travelerTypes,
    canDiscount = false,
    existingDraft = null,
    booking,
    isEditing = false,
}: Props) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Autosave state
    const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [showResumeBanner, setShowResumeBanner] = useState<boolean>(!isEditing && !!existingDraft);
    const isDirtyRef = useRef(false);

    // Form data state
    const [formData, setFormData] = useState<WizardFormData>(() => {
        if (booking) {
            return {
                customer_id: booking.customer_id?.toString() || '',
                tour_package_id: booking.tour_package_id?.toString() || '',
                booking_date: booking.booking_date || new Date().toISOString().split('T')[0],
                travel_date: booking.travel_date || '',
                return_date: booking.return_date || '',
                assigned_to: booking.assigned_to?.toString() || '',
                travelers: (booking.travelers || []).map(t => ({
                    id: t.id,
                    full_name: t.full_name,
                    traveler_type: (t.traveler_type as 'adult' | 'child' | 'infant') || 'adult',
                    passport_number: t.passport_number || '',
                    passport_expiry: t.passport_expiry || '',
                    dob: t.dob || '',
                    gender: t.gender || 'Male',
                    nationality: t.nationality || 'Sri Lankan',
                    special_requirements: t.special_requirements || '',
                })),
                extras: booking.extras || [],
                tax_amount: Number(booking.tax_amount || 0),
                discount_amount: Number(booking.discount_amount || 0),
                payment_plan: 'deposit_balance',
                deposit_amount: Math.round(Number(booking.final_amount || 0) * 0.20),
                payment_schedules: (booking.payment_schedules || []).map(s => ({
                    description: s.description,
                    amount: Number(s.amount),
                    due_date: s.due_date,
                })),
                record_payment: false,
                payment_amount: 0,
                payment_method: 'cash',
                payment_reference: '',
                notes: booking.notes || '',
            };
        }

        return {
            customer_id: '',
            tour_package_id: '',
            booking_date: new Date().toISOString().split('T')[0],
            travel_date: '',
            return_date: '',
            assigned_to: '',
            travelers: [
                {
                    full_name: '',
                    traveler_type: 'adult',
                    passport_number: '',
                    passport_expiry: '',
                    dob: '',
                    gender: 'Male',
                    nationality: 'Sri Lankan',
                    special_requirements: '',
                }
            ],
            extras: [],
            tax_amount: 0,
            discount_amount: 0,
            payment_plan: 'deposit_balance',
            deposit_amount: 0,
            payment_schedules: [],
            record_payment: false,
            payment_amount: 0,
            payment_method: 'cash',
            payment_reference: '',
            notes: '',
        };
    });

    const selectedCustomer = customers.find(c => c.id.toString() === formData.customer_id);
    const selectedPackage = packages.find(p => p.id.toString() === formData.tour_package_id);
    const assignedStaff = employees.find(e => e.id.toString() === formData.assigned_to);

    // Track dirty state
    const updateFormField = useCallback((field: keyof WizardFormData, value: any) => {
        isDirtyRef.current = true;
        setFormData(prev => ({ ...prev, [field]: value }));
        setStepErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    // Warn before leaving if dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirtyRef.current && !submitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [submitting]);

    // Autosave drafts debounced (every 3 seconds of inactivity)
    useEffect(() => {
        if (isEditing || !isDirtyRef.current) return;

        const timer = setTimeout(async () => {
            setDraftStatus('saving');
            try {
                const response = await axios.post('/bookings/draft', {
                    payload: formData,
                    step: currentStep,
                });
                if (response.data?.success) {
                    setDraftStatus('saved');
                    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                }
            } catch (err) {
                console.error('Draft autosave failed', err);
                setDraftStatus('idle');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [formData, currentStep, isEditing]);

    // Immediate draft save helper
    const triggerSaveDraftNow = async (step: number) => {
        if (isEditing) return;
        setDraftStatus('saving');
        try {
            const response = await axios.post('/bookings/draft', {
                payload: formData,
                step: step,
            });
            if (response.data?.success) {
                setDraftStatus('saved');
                setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
        } catch (err) {
            console.error('Draft save failed', err);
        }
    };

    // Resume draft action
    const handleResumeDraft = () => {
        if (!existingDraft) return;
        setFormData(prev => ({
            ...prev,
            ...existingDraft.payload,
        }));
        if (existingDraft.step >= 1 && existingDraft.step <= 6) {
            setCurrentStep(existingDraft.step);
            // Populate completed steps up to that step
            const completed = Array.from({ length: existingDraft.step - 1 }, (_, i) => i + 1);
            setCompletedSteps(completed);
        }
        setShowResumeBanner(false);
        toast.success('Draft restored successfully');
    };

    // Discard draft action
    const handleDiscardDraft = async () => {
        try {
            await axios.delete('/bookings/draft');
            setShowResumeBanner(false);
            toast.info('Draft discarded');
        } catch (err) {
            console.error('Failed to discard draft', err);
        }
    };

    // Validate current step with Zod before allowing Next
    const validateStep = (step: number): boolean => {
        setStepErrors({});

        try {
            if (step === 1) {
                step1Schema.parse({ customer_id: formData.customer_id });
            } else if (step === 2) {
                step2Schema.parse({
                    tour_package_id: formData.tour_package_id,
                    travel_date: formData.travel_date,
                    return_date: formData.return_date,
                });
            } else if (step === 3) {
                step3Schema.parse({ travelers: formData.travelers });
            } else if (step === 4) {
                step4Schema.parse({
                    discount_amount: formData.discount_amount,
                    tax_amount: formData.tax_amount,
                    extras: formData.extras,
                });
            } else if (step === 5) {
                step5Schema.parse({
                    deposit_amount: formData.deposit_amount,
                    record_payment: formData.record_payment,
                    payment_amount: formData.payment_amount,
                    payment_method: formData.payment_method,
                    payment_reference: formData.payment_reference,
                    payment_schedules: formData.payment_schedules,
                });
            }
            return true;
        } catch (error: any) {
            if (error.issues) {
                const formatted: Record<string, string> = {};
                error.issues.forEach((issue: any) => {
                    const key = issue.path.join('.');
                    formatted[key] = issue.message;
                });
                setStepErrors(formatted);
                const firstError = Object.values(formatted)[0];
                toast.error(firstError || 'Please complete all required fields.');
            }
            return false;
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;

        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps(prev => [...prev, currentStep]);
        }

        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        triggerSaveDraftNow(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        const prevStep = Math.max(1, currentStep - 1);
        setCurrentStep(prevStep);
        triggerSaveDraftNow(prevStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleJumpToStep = (step: number) => {
        setCurrentStep(step);
        triggerSaveDraftNow(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Keyboard accessibility: navigation shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent interference when typing in inputs/textareas
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'ArrowRight' && currentStep < 6) {
                handleNext();
            } else if (e.key === 'ArrowLeft' && currentStep > 1) {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, formData]);

    // Submit booking
    const handleFinalSubmit = () => {
        setSubmitting(true);
        isDirtyRef.current = false;

        const payload = {
            ...formData,
            customer_id: parseInt(formData.customer_id),
            tour_package_id: parseInt(formData.tour_package_id),
            assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
            travelers: formData.travelers.map(t => ({
                ...t,
                id: t.id,
                full_name: t.full_name,
                traveler_type: t.traveler_type,
                passport_number: t.passport_number || null,
                passport_expiry: t.passport_expiry || null,
                dob: t.dob || null,
                gender: t.gender || null,
                nationality: t.nationality || null,
                special_requirements: t.special_requirements || null,
            })),
            extras: formData.extras,
            tax_amount: formData.tax_amount,
            discount_amount: formData.discount_amount,
            payment_schedules: formData.payment_schedules,
            record_payment: formData.record_payment,
            payment_amount: formData.payment_amount,
            payment_method: formData.payment_method,
            payment_reference: formData.payment_reference,
            notes: formData.notes,
        };

        if (isEditing && booking) {
            router.put(route('bookings.update', { booking: booking.id }), payload as any, {
                onSuccess: () => {
                    toast.success('Booking updated successfully');
                },
                onError: (errors) => {
                    setSubmitting(false);
                    const msg = errors.error || Object.values(errors)[0] || 'Failed to update booking.';
                    toast.error(msg);
                }
            });
        } else {
            router.post(route('bookings.store'), payload as any, {
                onSuccess: () => {
                    toast.success('Booking created successfully');
                },
                onError: (errors) => {
                    setSubmitting(false);
                    const msg = errors.error || Object.values(errors)[0] || 'Failed to create booking.';
                    toast.error(msg);
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? `Edit Booking ${booking?.booking_reference}` : "New Booking Wizard"} />

            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                {/* Header with Title and Autosave Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {isEditing ? `Edit Booking ${booking?.booking_reference}` : 'Create New Booking'}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {isEditing
                                ? 'Update traveler details, pricing, or itinerary.'
                                : 'Fast 6-step guided booking wizard with automated financial calculations.'}
                        </p>
                    </div>

                    {/* Autosave Indicator */}
                    {!isEditing && (
                        <div className="flex items-center gap-2 text-xs bg-muted/60 px-3 py-1.5 rounded-full border self-start sm:self-auto">
                            {draftStatus === 'saving' ? (
                                <>
                                    <Cloud className="w-3.5 h-3.5 text-primary animate-pulse" />
                                    <span className="text-muted-foreground font-medium">Autosaving draft...</span>
                                </>
                            ) : draftStatus === 'saved' ? (
                                <>
                                    <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                        Draft saved {lastSavedTime ? `at ${lastSavedTime}` : 'just now'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Cloud className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Autosave enabled</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Resume Draft Banner */}
                {showResumeBanner && existingDraft && (
                    <Alert className="bg-primary/10 border-primary/20 text-foreground flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-5 h-5 text-primary shrink-0" />
                            <div>
                                <AlertTitle className="font-semibold text-primary">Unfinished Draft Found</AlertTitle>
                                <AlertDescription className="text-xs text-muted-foreground">
                                    You have a draft saved on {new Date(existingDraft.updated_at).toLocaleString()} (Step {existingDraft.step}). Would you like to resume where you left off?
                                </AlertDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDiscardDraft}
                                className="text-xs h-8"
                            >
                                Discard
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleResumeDraft}
                                className="text-xs h-8 gap-1"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Resume Draft
                            </Button>
                        </div>
                    </Alert>
                )}

                {/* Stepper Progress Bar */}
                <BookingStepper
                    currentStep={currentStep}
                    onStepClick={handleJumpToStep}
                    completedSteps={completedSteps}
                />

                {/* Step Content Panels */}
                <div className="pt-2">
                    {currentStep === 1 && (
                        <Step1Customer
                            customerId={formData.customer_id}
                            onSelectCustomer={(c) => updateFormField('customer_id', c.id ? c.id.toString() : '')}
                            assignedToId={formData.assigned_to}
                            onSelectAssignedTo={(empId) => updateFormField('assigned_to', empId)}
                            initialCustomers={customers}
                            employees={employees}
                            error={stepErrors.customer_id}
                            isEditing={isEditing}
                        />
                    )}

                    {currentStep === 2 && (
                        <Step2PackageDates
                            packageId={formData.tour_package_id}
                            onSelectPackage={(pkg) => updateFormField('tour_package_id', pkg.id.toString())}
                            bookingDate={formData.booking_date}
                            onChangeBookingDate={(d) => updateFormField('booking_date', d)}
                            travelDate={formData.travel_date}
                            onChangeTravelDate={(d) => updateFormField('travel_date', d)}
                            returnDate={formData.return_date}
                            onChangeReturnDate={(d) => updateFormField('return_date', d)}
                            packages={packages}
                            errors={stepErrors}
                            isEditing={isEditing}
                        />
                    )}

                    {currentStep === 3 && (
                        <Step3Travelers
                            travelers={formData.travelers}
                            onChangeTravelers={(travs) => updateFormField('travelers', travs)}
                            customer={selectedCustomer}
                            travelerTypes={travelerTypes}
                            errors={stepErrors}
                        />
                    )}

                    {currentStep === 4 && (
                        <Step4Pricing
                            packageItem={selectedPackage}
                            travelers={formData.travelers}
                            extras={formData.extras}
                            onChangeExtras={(ext) => updateFormField('extras', ext)}
                            taxAmount={formData.tax_amount}
                            onChangeTaxAmount={(tax) => updateFormField('tax_amount', tax)}
                            discountAmount={formData.discount_amount}
                            onChangeDiscountAmount={(disc) => updateFormField('discount_amount', disc)}
                            canDiscount={canDiscount}
                            errors={stepErrors}
                        />
                    )}

                    {currentStep === 5 && (
                        <Step5Payment
                            currency={(selectedPackage?.currency as 'LKR' | 'USD') || 'LKR'}
                            finalTotal={Math.max(
                                0,
                                (Number(selectedPackage?.price || 0) * formData.travelers.length) +
                                formData.extras.reduce((s, e) => s + Number(e.price || 0), 0) +
                                Number(formData.tax_amount || 0) -
                                Number(formData.discount_amount || 0)
                            )}
                            travelDate={formData.travel_date}
                            bookingDate={formData.booking_date}
                            paymentPlan={formData.payment_plan}
                            onChangePaymentPlan={(p) => updateFormField('payment_plan', p)}
                            depositAmount={formData.deposit_amount}
                            onChangeDepositAmount={(dep) => updateFormField('deposit_amount', dep)}
                            schedules={formData.payment_schedules}
                            onChangeSchedules={(sched) => updateFormField('payment_schedules', sched)}
                            recordPayment={formData.record_payment}
                            onChangeRecordPayment={(rec) => updateFormField('record_payment', rec)}
                            paymentAmount={formData.payment_amount}
                            onChangePaymentAmount={(amt) => updateFormField('payment_amount', amt)}
                            paymentMethod={formData.payment_method}
                            onChangePaymentMethod={(m) => updateFormField('payment_method', m)}
                            paymentReference={formData.payment_reference}
                            onChangePaymentReference={(ref) => updateFormField('payment_reference', ref)}
                            errors={stepErrors}
                        />
                    )}

                    {currentStep === 6 && (
                        <Step6Review
                            customer={selectedCustomer}
                            packageItem={selectedPackage}
                            bookingDate={formData.booking_date}
                            travelDate={formData.travel_date}
                            returnDate={formData.return_date}
                            travelers={formData.travelers}
                            extras={formData.extras}
                            taxAmount={formData.tax_amount}
                            discountAmount={formData.discount_amount}
                            paymentPlan={formData.payment_plan}
                            schedules={formData.payment_schedules}
                            recordPayment={formData.record_payment}
                            paymentAmount={formData.payment_amount}
                            paymentMethod={formData.payment_method}
                            paymentReference={formData.payment_reference}
                            notes={formData.notes}
                            onChangeNotes={(n) => updateFormField('notes', n)}
                            assignedStaff={assignedStaff}
                            onJumpToStep={handleJumpToStep}
                            onSubmit={handleFinalSubmit}
                            submitting={submitting}
                            isEditing={isEditing}
                        />
                    )}
                </div>

                {/* Footer Navigation Bar */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 1 || submitting}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous Step
                    </Button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            Step {currentStep} of 6
                        </span>

                        {currentStep < 6 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="gap-2 font-semibold shadow-xs"
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={submitting}
                                className="gap-2 font-semibold shadow-md"
                            >
                                {submitting ? 'Creating Booking...' : isEditing ? 'Save Changes' : 'Confirm & Create'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
