
import React from 'react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Jakarta (WIB)', value: 'Asia/Jakarta' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h4 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
        </svg>
        ENGINE CONFIGURATION
      </h4>

      <div className="space-y-6">
        {/* Scalping Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div>
            <div className="text-xs font-black text-slate-200 uppercase tracking-widest">Scalping Mode</div>
            <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">High Sensitivity • Faster Signals</div>
          </div>
          <button 
            onClick={() => onUpdate({ ...settings, scalpingMode: !settings.scalpingMode })}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.scalpingMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.scalpingMode ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Breakout Sensitivity */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            <span>Breakout Sensitivity</span>
            <span className="text-indigo-400">x{settings.breakoutSensitivity.toFixed(1)}</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value={settings.breakoutSensitivity}
            onChange={(e) => onUpdate({ ...settings, breakoutSensitivity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase mt-1">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
        </div>

        {/* Timezone Setting */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Display Timezone</label>
          <select 
            value={settings.timezone}
            onChange={(e) => onUpdate({ ...settings, timezone: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        {/* Risk Management */}
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            <span>Risk per Trade</span>
            <span className="text-indigo-400">{settings.riskPercentage}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1" 
            value={settings.riskPercentage}
            onChange={(e) => onUpdate({ ...settings, riskPercentage: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            <span>Risk Reward Ratio</span>
            <span className="text-emerald-400">1 : {settings.rrRatio}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 1.5, 2, 3].map(ratio => (
              <button 
                key={ratio}
                onClick={() => onUpdate({ ...settings, rrRatio: ratio })}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${settings.rrRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                1:{ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
          <p className="text-[10px] text-indigo-400/70 font-medium leading-relaxed italic">
            * Engine logic adapts based on Scalping and Breakout configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
