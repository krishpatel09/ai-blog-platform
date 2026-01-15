'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatsData } from "@/types/blog.types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, Users, Heart } from "lucide-react";

// Mock stats data
const statsData: StatsData[] = [
    { date: 'Jan 1', views: 120, reads: 85 },
    { date: 'Jan 3', views: 180, reads: 130 },
    { date: 'Jan 5', views: 250, reads: 190 },
    { date: 'Jan 7', views: 320, reads: 240 },
    { date: 'Jan 9', views: 280, reads: 210 },
    { date: 'Jan 11', views: 390, reads: 300 },
    { date: 'Jan 13', views: 450, reads: 350 },
];

const StatCard = ({ icon: Icon, label, value, change }: { icon: any, label: string, value: string, change: string }) => (
    <div className="p-6 rounded-3xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gray-100">
                <Icon size={24} className="text-gray-700" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <TrendingUp size={14} />
                {change}
            </span>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{label}</p>
    </div>
);

export default function MonitoringPage() {
    return (
        <DashboardLayout showRightSidebar={false}>
            <div className="flex flex-col gap-8">
                {/* Page Header */}
                <div className="border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Stats</h1>
                    <p className="text-gray-600 mt-1">Track your stories' performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        icon={Eye}
                        label="Total Views"
                        value="12.5K"
                        change="+12.5%"
                    />
                    <StatCard
                        icon={Users}
                        label="Total Reads"
                        value="8.2K"
                        change="+8.3%"
                    />
                    <StatCard
                        icon={Heart}
                        label="Total Likes"
                        value="1.8K"
                        change="+15.2%"
                    />
                </div>

                {/* Chart Section */}
                <div className="p-8 rounded-3xl border border-gray-200 bg-white">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Views Over Time</h2>
                        <p className="text-gray-600">Your story views and reads for the last 14 days</p>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={statsData}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                stroke="#9ca3af"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorViews)"
                            />
                            <Area
                                type="monotone"
                                dataKey="reads"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorReads)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-8 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-600">Reads</span>
                        </div>
                    </div>
                </div>

                {/* Top Stories */}
                <div className="p-8 rounded-3xl border border-gray-200 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performing Stories</h2>
                    <div className="space-y-4">
                        {[
                            { title: 'My Journey into Web Development', views: 542, reads: 412 },
                            { title: 'Understanding React Hooks', views: 389, reads: 298 },
                            { title: 'CSS Grid vs Flexbox', views: 267, reads: 201 },
                        ].map((story, index) => (
                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{story.title}</h3>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={16} />
                                        {story.views}
                                    </span>
                                    <span>{story.reads} reads</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
