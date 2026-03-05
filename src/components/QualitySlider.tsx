"use client";

const MIN = 18;
const MAX = 42;

interface QualityBand {
  max: number;
  label: string;
}

// Ordered from best to worst quality (low CRF = better)
const BANDS: QualityBand[] = [
  { max: 21, label: "visually lossless" },
  { max: 25, label: "high quality" },
  { max: 30, label: "balanced" },
  { max: 37, label: "small file" },
  { max: 42, label: "min size" },
];

function getLabel(crf: number): string {
  return BANDS.find((b) => crf <= b.max)?.label ?? "min size";
}

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function QualitySlider({ value, onChange, disabled }: Props) {
  const pct = ((value - MIN) / (MAX - MIN)) * 100;
  const label = getLabel(value);

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-white">quality (crf)</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold text-rose-400">
            {value}
          </span>
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          style={{ accentColor: "#f43f5e" }}
        />

        {/* Tick marks for key values */}
        <div className="mt-1 flex justify-between px-0.5">
          {[18, 23, 28, 35, 42].map((tick) => (
            <div key={tick} className="flex flex-col items-center gap-0.5">
              <div className="h-1 w-px bg-zinc-600" />
              <span className="font-mono text-[9px] text-zinc-600">{tick}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>← better quality / larger file</span>
        <span>smaller file / lower quality →</span>
      </div>

      {/* Quality band indicator */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
