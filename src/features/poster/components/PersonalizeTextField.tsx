'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

type Props<T extends FieldValues> = {
  control: Control<T>;
  /** A text field of the form: `title`, `names` or `quote`. */
  name: Path<T>;
  label: string;
  placeholder: string;
  hint?: string;
};

/** One of a poster's texts: a label, the field, its hint and its error. */
export function PersonalizeTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  hint,
}: Props<T>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`personalize-${name}`} className="text-[13px] font-medium text-[#E8D9B8]">
        {label}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <InputGroup className="h-11 has-[[data-slot=input-group-control]:focus-visible]:border-[#CEB47B]/50 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[#CEB47B]/10">
              <InputGroupAddon>
                <Pencil className="size-4 text-white/25" />
              </InputGroupAddon>
              <InputGroupInput
                {...field}
                id={`personalize-${name}`}
                placeholder={placeholder}
                className="h-11 text-right text-sm text-white placeholder:text-white/45"
              />
            </InputGroup>
            {hint && <p className="text-[11px] text-[#AAB6CD]">{hint}</p>}
            {fieldState.error && (
              <p className="text-[11px] text-red-400">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
}
