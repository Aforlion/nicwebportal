"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StudentChartView({ type, dataStr, title }: { type: string, dataStr: string, title?: string }) {
    let data = []
    try {
        data = JSON.parse(dataStr || '[]')
    } catch (e) {}

    const renderChart = () => {
        if (!data || data.length === 0) return <div className="p-4 text-center text-muted-foreground">No data to display</div>

        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                )
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )
            case 'bar':
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )
        }
    }

    return (
        <Card className="my-8 border border-muted shadow-sm overflow-hidden not-prose">
            {title && (
                <CardHeader className="bg-muted/30 py-3 border-b">
                    <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-4">
                {renderChart()}
            </CardContent>
        </Card>
    )
}
