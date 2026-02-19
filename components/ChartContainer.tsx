
import React, { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  SeriesMarker,
  Time,
  IPriceLine,
} from 'lightweight-charts';
import { Candlestick, TradingSignal } from '../types.ts';
import { IndicatorCalculator } from '../services/tradingLogic.ts';
import { translations, Language } from '../translations.ts';

interface ChartContainerProps {
  data: Candlestick[];
  pair: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  timezone: string;
  onRunAnalysis: () => void;
  lang: Language;
  history?: TradingSignal[];
  currentSignal?: TradingSignal | null;
}

const TIMEFRAMES = [
  { label: '1M', value: '1m' },
  { label: '5M', value: '5m' },
  { label: '15M', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
];

const isFiniteNum = (v: any): v is number =>
  typeof v === 'number' && isFinite(v) && !isNaN(v);

const ChartContainer: React.FC<ChartContainerProps> = ({
  data, pair, timeframe, onTimeframeChange, timezone, onRunAnalysis, lang, history = [], currentSignal = null
}) => {
  const t = translations[lang];
  const isMounted = useRef(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // v5: simpan instance createSeriesMarkers untuk update/cleanup
  const markersInstanceRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(null);

  const updateChartData = useCallback((newData: Candlestick[]) => {
    if (!isMounted.current || !newData || !candleSeriesRef.current || !chartRef.current) return;

    try {
      const rawSorted = [...newData]
        .filter(d =>
          d &&
          isFiniteNum(d.time) &&
          isFiniteNum(d.open) &&
          isFiniteNum(d.high) &&
          isFiniteNum(d.low) &&
          isFiniteNum(d.close)
        )
        .sort((a, b) => a.time - b.time);

      if (rawSorted.length === 0) return;

      const validCandles: { time: Time; open: number; high: number; low: number; close: number }[] = [];
      const seenTimes = new Set<number>();
      let lastIntTime = -Infinity;

      for (const d of rawSorted) {
        const ts = Math.floor(d.time);
        if (isFiniteNum(ts) && ts > lastIntTime && !seenTimes.has(ts)) {
          validCandles.push({ time: ts as Time, open: d.open, high: d.high, low: d.low, close: d.close });
          seenTimes.add(ts);
          lastIntTime = ts;
        }
      }

      if (validCandles.length === 0) return;

      const prices = validCandles.map(d => d.close as number);
      const times = validCandles.map(d => d.time);

      const ema9Val = IndicatorCalculator.calculateEMA(prices, 9);
      const ema21Val = IndicatorCalculator.calculateEMA(prices, 21);
      const ema50Val = IndicatorCalculator.calculateEMA(prices, 50);
      const ema200Val = IndicatorCalculator.calculateEMA(prices, 200);
      const rsiVal = IndicatorCalculator.calculateRSI(prices, 14);

      const mapToLineData = (vals: number[]) =>
        times
          .map((t, i) => {
            const val = vals[i];
            return isFiniteNum(val) ? { time: t, value: val } : null;
          })
          .filter((p): p is { time: Time; value: number } => p !== null);

      try {
        candleSeriesRef.current.setData(validCandles);
        if (ema9SeriesRef.current) ema9SeriesRef.current.setData(mapToLineData(ema9Val));
        if (ema21SeriesRef.current) ema21SeriesRef.current.setData(mapToLineData(ema21Val));
        if (ema50SeriesRef.current) ema50SeriesRef.current.setData(mapToLineData(ema50Val));
        if (ema200SeriesRef.current) ema200SeriesRef.current.setData(mapToLineData(ema200Val));
        if (rsiSeriesRef.current) {
          rsiSeriesRef.current.setData(
            times.map((t, i) => ({
              time: t,
              value: isFiniteNum(rsiVal[i]) ? rsiVal[i] : 50,
            }))
          );
        }
      } catch (innerError) {
        console.warn('Inner chart update rejected:', innerError);
      }
    } catch (e) {
      console.error('Chart data pipeline failure:', e);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Marker sync — v5 pakai createSeriesMarkers(), bukan series.setMarkers()
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series || !isMounted.current) return;

    try {
      const currentTimes = new Set(data.map(d => Math.floor(d.time)));
      const markerTimes = new Set<number>();

      const markers: SeriesMarker<Time>[] = (!history || history.length === 0) ? [] : history
        .filter(s => s && isFiniteNum(s.timestamp) && s.isBreakout && s.pair === pair)
        .map(s => {
          const isBullish = s.signal.includes('BUY');
          const time = Math.floor(s.timestamp / 1000);
          return {
            time: time as Time,
            position: (isBullish ? 'belowBar' : 'aboveBar') as any,
            color: isBullish ? '#10b981' : '#f43f5e',
            shape: (isBullish ? 'arrowUp' : 'arrowDown') as any,
            text: 'BREAKOUT',
            size: 2,
          };
        })
        .filter(m => {
          const ts = m.time as number;
          if (isFiniteNum(ts) && ts > 0 && !markerTimes.has(ts) && currentTimes.has(ts)) {
            markerTimes.add(ts);
            return true;
          }
          return false;
        });

      markers.sort((a, b) => (a.time as number) - (b.time as number));

      if (markersInstanceRef.current) {
        // Update instance yang sudah ada
        markersInstanceRef.current.setMarkers(markers);
      } else {
        // Buat instance baru
        markersInstanceRef.current = createSeriesMarkers(series, markers);
      }
    } catch (e) {
      console.warn('Marker sync suppressed:', e);
    }
  }, [history, pair, data]);

  // Main Chart Initialization
  useEffect(() => {
    if (!chartContainerRef.current || !rsiContainerRef.current) return;

    // v5: langsung pakai createChart dari import, tanpa namespace/default fallback
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 480,
      layout: {
        background: { color: '#020617' },
        textColor: '#94a3b8',
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#334155', autoScale: true },
      timeScale: { borderColor: '#334155', timeVisible: true },
    });

    // v5: addSeries(SeriesTypeClass, options) — bukan addCandlestickSeries/addLineSeries
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const ema9Series = chart.addSeries(LineSeries, { color: '#6366f1', lineWidth: 1, title: 'EMA 9' });
    const ema21Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'EMA 21' });
    const ema50Series = chart.addSeries(LineSeries, { color: '#ec4899', lineWidth: 2, title: 'EMA 50' });
    const ema200Series = chart.addSeries(LineSeries, { color: '#ffffff', lineWidth: 2, title: 'EMA 200' });

    const rsiChart = createChart(rsiContainerRef.current, {
      width: rsiContainerRef.current.clientWidth || 800,
      height: 140,
      layout: {
        background: { color: '#020617' },
        textColor: '#94a3b8',
        fontFamily: 'JetBrains Mono, monospace',
      },
      timeScale: { visible: false },
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2 });
    rsiSeries.createPriceLine({ price: 70, color: '#f43f5e', lineWidth: 1, lineStyle: 1, title: 'OB' });
    rsiSeries.createPriceLine({ price: 30, color: '#10b981', lineWidth: 1, lineStyle: 1, title: 'OS' });

    chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      if (range && rsiChart && isMounted.current) {
        if (range.from !== null && range.to !== null && range.from < range.to) {
          try { rsiChart.timeScale().setVisibleRange(range); } catch (e) { }
        }
      }
    });

    chartRef.current = chart;
    rsiChartRef.current = rsiChart;
    candleSeriesRef.current = candleSeries;
    ema9SeriesRef.current = ema9Series;
    ema21SeriesRef.current = ema21Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;
    rsiSeriesRef.current = rsiSeries;

    const handleResize = () => {
      if (!isMounted.current) return;
      if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      if (rsiContainerRef.current) rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    updateChartData(data);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Cleanup markers dulu sebelum chart di-remove
      if (markersInstanceRef.current) {
        try { markersInstanceRef.current.setMarkers([]); } catch (e) { }
        markersInstanceRef.current = null;
      }
      chart.remove();
      rsiChart.remove();
      chartRef.current = null;
      rsiChartRef.current = null;
      candleSeriesRef.current = null;
      ema9SeriesRef.current = null;
      ema21SeriesRef.current = null;
      ema50SeriesRef.current = null;
      ema200SeriesRef.current = null;
      rsiSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    updateChartData(data);
  }, [data, updateChartData]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl gap-4">
        <div>
          <h3 className="font-black text-slate-100 text-sm uppercase tracking-[0.2em] mb-1.5">{t.marketTerminal}</h3>
          <span className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {pair} • {timeframe.toUpperCase()}
          </span>
        </div>
        <div className="flex bg-slate-950/50 rounded-xl p-1 border border-slate-800 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest min-w-[50px] ${timeframe === tf.value ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <button
          onClick={onRunAnalysis}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {t.neuralAnalysis}
        </button>
      </div>
      <div className="flex flex-col min-h-[620px]">
        <div ref={chartContainerRef} className="w-full h-[480px]" />
        <div className="px-6 py-2 bg-slate-950/50 border-t border-b border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Oscillator: RSI (14)</span>
          <span className="text-[9px] text-indigo-400/60 font-mono tracking-widest">Institutional Filter</span>
        </div>
        <div ref={rsiContainerRef} className="w-full h-[140px]" />
      </div>
    </div>
  );
};

export default ChartContainer;
