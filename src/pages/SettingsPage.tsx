import React, { useState } from 'react';
import { Sliders, Moon, Download, Upload, Trash2, Check, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [restTimer, setRestTimer] = useState('90');
  const [increment, setIncrement] = useState('2.5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="px-1">
        <h2 className="text-xl font-black text-white">App Settings</h2>
        <p className="text-xs text-zinc-400">Configure preferences, timer defaults, and backup data</p>
      </div>

      {/* Workout Preferences */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-400" />
          General Preferences
        </h3>

        <div className="space-y-3 text-xs">
          {/* Weight Units */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="font-semibold text-zinc-200 block">Weight Unit</span>
              <span className="text-[11px] text-zinc-500">Kilograms or Pounds</span>
            </div>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setUnit('kg')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  unit === 'kg' ? 'bg-blue-600 text-white' : 'text-zinc-400'
                }`}
              >
                KG
              </button>
              <button
                onClick={() => setUnit('lbs')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  unit === 'lbs' ? 'bg-blue-600 text-white' : 'text-zinc-400'
                }`}
              >
                LBS
              </button>
            </div>
          </div>

          {/* Default Rest Timer */}
          <div className="flex items-center justify-between py-1 border-t border-zinc-800/60">
            <div>
              <span className="font-semibold text-zinc-200 block">Default Rest Timer</span>
              <span className="text-[11px] text-zinc-500">Auto-start rest duration</span>
            </div>
            <select
              value={restTimer}
              onChange={(e) => setRestTimer(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="60">60 sec</option>
              <option value="90">90 sec</option>
              <option value="120">120 sec (2 min)</option>
              <option value="180">180 sec (3 min)</option>
            </select>
          </div>

          {/* Default Increment */}
          <div className="flex items-center justify-between py-1 border-t border-zinc-800/60">
            <div>
              <span className="font-semibold text-zinc-200 block">Weight Increment</span>
              <span className="text-[11px] text-zinc-500">Progression jump recommendation</span>
            </div>
            <select
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="1.25">1.25 kg</option>
              <option value="2.5">2.5 kg</option>
              <option value="5.0">5.0 kg</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </div>

      {/* Data Backup & Export */}
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Data Backup & Local Persistence
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <button
            onClick={() => alert('Data export JSON triggered.')}
            className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 flex flex-col items-center gap-1.5 text-zinc-300 font-semibold"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => alert('Data import triggered.')}
            className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 flex flex-col items-center gap-1.5 text-zinc-300 font-semibold"
          >
            <Upload className="w-4 h-4 text-zinc-400" />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl space-y-2">
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">Danger Zone</span>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all workout history?')) {
              alert('Database reset.');
            }
          }}
          className="w-full py-2.5 bg-red-950/60 border border-red-800/50 hover:bg-red-900/60 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Workout History</span>
        </button>
      </div>
    </div>
  );
};
