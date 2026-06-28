import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { ChevronLeft, ChevronRight, CalendarDays, RefreshCcw, Shirt } from 'lucide-react';
import { wearLogAPI, getThumbUrl } from '@/services/api';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function WearCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = startOfMonth(year, month);
  const lastDay = new Date(year, month + 1, 0);

  const { data, isLoading } = useQuery(
    ['wearlog-range', year, month],
    () => wearLogAPI.getRange({
      from: firstDay.toISOString(),
      to: lastDay.toISOString(),
    }),
    { keepPreviousData: true }
  );

  const { data: rotationData } = useQuery(
    'wearlog-rotation',
    () => wearLogAPI.getRotation({ limit: 8 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const logs = data?.data?.logs || [];

  // Group logs by calendar date
  const byDate = {};
  for (const log of logs) {
    const d = isoDate(new Date(log.date));
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(log);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const startWeekday = firstDay.getDay();
  const totalDays = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const neglected = rotationData?.data?.items || [];

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-neon-green" />
          Wear Calendar
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 glass rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 glass rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-700/50">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-neon-green" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-800/50" />;
              const dateStr = isoDate(new Date(year, month, day));
              const dayLogs = byDate[dateStr] || [];
              const isToday = dateStr === isoDate(today);

              return (
                <div
                  key={dateStr}
                  className={`min-h-[80px] border-b border-r border-gray-800/50 p-2 transition-colors ${
                    isToday ? 'bg-neon-green/5 border-neon-green/30' : 'hover:bg-black-700/30'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-neon-green' : 'text-gray-500'}`}>
                    {day}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayLogs.slice(0, 3).map((log, li) => {
                      const imgSrc = log.item ? getThumbUrl(log.item) : null;
                      return imgSrc ? (
                        <img
                          key={li}
                          src={imgSrc}
                          alt={log.item?.name}
                          className="w-7 h-7 rounded-md object-cover border border-gray-700"
                          title={log.item?.name || log.outfit?.name}
                        />
                      ) : (
                        <div
                          key={li}
                          className="w-7 h-7 rounded-md bg-black-700 border border-gray-700 flex items-center justify-center"
                          title={log.outfit?.name || 'Outfit'}
                        >
                          <Shirt className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      );
                    })}
                    {dayLogs.length > 3 && (
                      <span className="text-[10px] text-gray-500 self-end">+{dayLogs.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rotation / Neglected Items */}
      {neglected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-yellow-600/30 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <RefreshCcw className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold text-white">Time to Rotate</h2>
            <span className="text-xs text-gray-500 ml-1">Items you haven't worn recently</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {neglected.map(item => (
              <div key={item._id} className="flex items-center gap-2 p-2 bg-black-700/50 rounded-xl border border-gray-700 hover:border-yellow-600/30 transition-colors">
                {getThumbUrl(item) ? (
                  <img
                    src={getThumbUrl(item)}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-black-800 flex items-center justify-center flex-shrink-0">
                    <Shirt className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.daysSinceWorn !== null ? `${item.daysSinceWorn}d ago` : 'Never worn'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
