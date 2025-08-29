import React from 'react';
import { Switch } from '@/components/ui/shadcn/switch';
import { Input } from '@/components/ui/shadcn/input';
import { Clock, Power } from 'lucide-react';

function DoorManagementCard({ validationConfig, onValidationActiveChange, onConfigChange }) {
  if (!validationConfig) return null;

  return (
    <div className='flex flex-col items-center gap-10 w-full'>
      <span className='text-4xl'>Door</span>

      <div className='flex gap-10 flex-wrap justify-center'>
        <div className='h-[100px] flex flex-col items-center justify-between'>
          <Power size={50} />
          <Switch
            checked={validationConfig.isValidationActive}
            onCheckedChange={onValidationActiveChange}
          />
        </div>
        <div className='flex flex-col items-center justify-between gap-6'>
          <Clock size={50} />
          <div className="flex items-center gap-2">
            <div>
              <label className="text-sm">Start hour</label>
              <Input
                type="number"
                min={0}
                max={23}
                step={1}
                value={validationConfig?.validationStartHour ?? ''}
                onChange={e =>
                  onConfigChange({
                    ...validationConfig,
                    validationStartHour: Math.max(0, Math.min(23, Number(e.target.value)))
                  })
                }
                className="border rounded px-2 py-1 text-center"
                placeholder="0-23"
              />
            </div>
            <div>
              <label className="text-sm">End hour</label>
              <Input
                type="number"
                min={0}
                max={23}
                step={1}
                value={validationConfig?.validationEndHour ?? ''}
                onChange={e =>
                  onConfigChange({
                    ...validationConfig,
                    validationEndHour: Math.max(0, Math.min(23, Number(e.target.value)))
                  })
                }
                className="border rounded px-2 py-1 text-center"
                placeholder="0-23"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoorManagementCard;
