import React from 'react';
import { useFieldArray } from 'react-hook-form';
import Input from './Input';
import Select from './Select';

/**
 * Renders one form card per traveller using react-hook-form's useFieldArray.
 * The traveller count is fixed by the search (adults + children + infants), so
 * the parent seeds `defaultValues.passengers`. This component owns the per-field
 * registration + validation — the meat of SkyFare's "complex form state" lesson.
 */
const PassengerFields = ({ control, register, errors = {} }) => {
  const { fields } = useFieldArray({ control, name: 'passengers' });
  const passengerErrors = errors.passengers || [];

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const err = passengerErrors[index] || {};
        return (
          <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <h4 className="text-sm font-semibold text-slate-700">
                {index === 0 ? 'Lead passenger' : `Passenger ${index + 1}`}
                {field.type && (
                  <span className="ml-2 rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                    {field.type}
                  </span>
                )}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
              <Select
                label="Title"
                containerClassName="col-span-2 sm:col-span-2"
                error={err.title?.message}
                {...register(`passengers.${index}.title`, { required: 'Required' })}
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </Select>

              <Input
                label="First name"
                containerClassName="col-span-2 sm:col-span-5"
                placeholder="As on passport"
                error={err.firstName?.message}
                {...register(`passengers.${index}.firstName`, {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'Too short' },
                })}
              />

              <Input
                label="Last name"
                containerClassName="col-span-2 sm:col-span-5"
                placeholder="As on passport"
                error={err.lastName?.message}
                {...register(`passengers.${index}.lastName`, {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Too short' },
                })}
              />

              <Input
                type="date"
                label="Date of birth"
                containerClassName="col-span-2 sm:col-span-6"
                max={new Date().toISOString().slice(0, 10)}
                error={err.dateOfBirth?.message}
                {...register(`passengers.${index}.dateOfBirth`, {
                  required: 'Date of birth is required',
                })}
              />

              <Select
                label="Gender"
                containerClassName="col-span-2 sm:col-span-6"
                error={err.gender?.message}
                {...register(`passengers.${index}.gender`, { required: 'Required' })}
              >
                <option value="">Select…</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PassengerFields;
