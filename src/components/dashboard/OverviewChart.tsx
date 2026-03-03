'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ChartData {
    month: string;
    revenue: number;
    expense: number;
}

interface OverviewChartProps {
    data: ChartData[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <Card className="lg:col-span-2 overflow-hidden flex flex-col pt-0 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                    <ArrowDownUp className="h-5 w-5 text-muted-foreground group-hover:text-nautify-500 transition-colors" />
                    Receitas vs Despesas
                </CardTitle>
                <Link href="/financeiro/fluxo-caixa">
                    <Button variant="ghost" size="sm" className="hidden sm:flex group-hover:bg-primary/5">
                        Ver detalhes <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-1 pb-0 px-1 sm:px-6">
                <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--emerald-500, #10b981)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--emerald-500, #10b981)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--red-500, #ef4444)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--red-500, #ef4444)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `R$${value / 1000}k`}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md">
                                                <p className="text-sm font-bold mb-3">{label}</p>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        </div>
                                                        <span className="text-sm text-muted-foreground mr-4">Receitas:</span>
                                                        <span className="text-sm font-bold ml-auto">{formatCurrency(payload[0].value as number)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-red-500/20">
                                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        </div>
                                                        <span className="text-sm text-muted-foreground mr-4">Despesas:</span>
                                                        <span className="text-sm font-bold ml-auto">{formatCurrency(payload[1].value as number)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Receitas"
                                stroke="var(--emerald-500, #10b981)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--emerald-500, #10b981)' }}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="Despesas"
                                stroke="var(--red-500, #ef4444)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorExpense)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--red-500, #ef4444)' }}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
