'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DatePickerProps {
    value?: Date;
    onChange?: (date?: Date) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * DatePicker combines Popover and Calendar from shadcn/ui.
 *
 * @example
 * <DatePicker value={date} onChange={setDate} />
 */
export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled = false,
    className,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant={'outline'}
                        disabled={disabled}
                        className={cn(
                            'w-[240px] justify-start text-left font-normal',
                            !value && 'text-muted-foreground',
                            className,
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, 'PPP') : <span>{placeholder}</span>}
                    </Button>
                }
            />
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={value} onSelect={onChange} />
            </PopoverContent>
        </Popover>
    );
}
