import React from 'react';
import { User, MapPin, Users, Calculator, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
}

const STEPS: Step[] = [
    { id: 1, title: 'Customer', description: 'Select or add client', icon: User },
    { id: 2, title: 'Package & Dates', description: 'Tour & departures', icon: MapPin },
    { id: 3, title: 'Travelers', description: 'Passenger details', icon: Users },
    { id: 4, title: 'Pricing', description: 'Costs & discounts', icon: Calculator },
    { id: 5, title: 'Payment', description: 'Plan & deposit', icon: CreditCard },
    { id: 6, title: 'Review', description: 'Confirm booking', icon: CheckCircle2 },
];

interface BookingStepperProps {
    currentStep: number;
    onStepClick: (step: number) => void;
    completedSteps: number[];
}

export default function BookingStepper({ currentStep, onStepClick, completedSteps }: BookingStepperProps) {
    return (
        <div className="w-full bg-card border rounded-xl p-4 shadow-xs">
            {/* Desktop & Tablet Stepper */}
            <div className="hidden md:flex items-center justify-between relative">
                {STEPS.map((step, idx) => {
                    const isCurrent = currentStep === step.id;
                    const isCompleted = completedSteps.includes(step.id);
                    const isClickable = isCompleted || step.id <= currentStep;
                    const Icon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(step.id)}
                                disabled={!isClickable}
                                className={cn(
                                    "flex flex-col items-center group relative z-10 transition-all duration-200 outline-none",
                                    isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 shadow-xs",
                                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105",
                                        isCompleted && !isCurrent && "bg-emerald-600 text-white hover:bg-emerald-700",
                                        !isCurrent && !isCompleted && "bg-muted text-muted-foreground border border-border"
                                    )}
                                >
                                    {isCompleted && !isCurrent ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <span
                                        className={cn(
                                            "text-xs font-semibold block transition-colors",
                                            isCurrent ? "text-primary font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.id}. {step.title}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground hidden lg:block">
                                        {step.description}
                                    </span>
                                </div>
                            </button>

                            {/* Connecting Line between steps */}
                            {idx < STEPS.length - 1 && (
                                <div className="flex-1 mx-2 mb-6 h-0.5 relative bg-border">
                                    <div
                                        className="h-full bg-emerald-600 transition-all duration-300"
                                        style={{
                                            width: completedSteps.includes(step.id) ? '100%' : '0%'
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Mobile Compact Progress Bar */}
            <div className="flex md:hidden flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">
                        Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
                    </span>
                    <span className="text-muted-foreground">
                        {Math.round((currentStep / STEPS.length) * 100)}% Complete
                    </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
