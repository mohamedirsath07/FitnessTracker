import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#111114]/95 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2 shadow-2xl">
            <div className="text-[10px] font-medium text-zinc-500 mb-1">{label}</div>
            <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-[12px] font-semibold text-zinc-200 tabular-nums">{payload[0]?.value?.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500">kcal</span>
            </div>
        </div>
    );
};

export default function WeeklyChart({ data = [] }) {
    const chartData = data.map(d => ({ day: d.day, burn: d.burned || 0 }));

    return (
        <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                        dataKey="day"
                        stroke="#3f3f46"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                        tick={{ fill: '#52525b' }}
                    />
                    <YAxis
                        stroke="#3f3f46"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-8}
                        tick={{ fill: '#52525b' }}
                        width={32}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                        type="monotone"
                        dataKey="burn"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBurn)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#3B82F6', stroke: '#030303', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
