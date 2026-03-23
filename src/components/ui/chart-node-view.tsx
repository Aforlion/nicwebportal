"use client"

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Edit2, Check, Trash } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import Textarea from '@/components/ui/textarea'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ChartNodeView(props: NodeViewProps) {
    const { node, updateAttributes, deleteNode } = props
    const [isEditing, setIsEditing] = useState(!node.attrs.data || node.attrs.data.length === 0)
    
    // Default raw structured text to parse
    const defaultRawData = node.attrs.data && node.attrs.data.length > 0 
        ? JSON.stringify(node.attrs.data, null, 2)
        : '[\n  { "name": "Jan", "value": 400 },\n  { "name": "Feb", "value": 300 }\n]'
        
    const [rawData, setRawData] = useState(defaultRawData)

    const handleSave = () => {
        try {
            const parsed = JSON.parse(rawData)
            if (Array.isArray(parsed)) {
                updateAttributes({ data: parsed })
                setIsEditing(false)
            } else {
                alert("Data must be a JSON array of objects.")
            }
        } catch (e) {
            alert("Invalid JSON data format.")
        }
    }

    const renderChart = () => {
        const data = node.attrs.data
        if (!data || data.length === 0) return <div className="p-4 text-center text-muted-foreground">No data to display</div>

        switch (node.attrs.type) {
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
        <NodeViewWrapper className="chart-component my-6 react-component">
            <Card className="border-2 border-muted overflow-hidden">
                <CardHeader className="bg-muted/30 py-3 flex flex-row items-center justify-between space-y-0">
                    {isEditing ? (
                        <Input 
                            value={node.attrs.title} 
                            onChange={(e) => updateAttributes({ title: e.target.value })} 
                            className="w-1/2 h-8"
                            placeholder="Chart Title" 
                        />
                    ) : (
                        <CardTitle className="text-sm font-semibold">{node.attrs.title || "Data Chart"}</CardTitle>
                    )}
                    
                    <div className="flex gap-2">
                        {isEditing ? (
                            <Button size="sm" variant="default" onClick={handleSave} className="h-8">
                                <Check className="h-4 w-4 mr-1" /> Save
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-8">
                                <Edit2 className="h-4 w-4 mr-1" /> Edit
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={deleteNode}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="flex gap-2 text-sm mb-2">
                                <Button 
                                    size="sm" 
                                    variant={node.attrs.type === 'bar' ? 'default' : 'outline'} 
                                    onClick={() => updateAttributes({ type: 'bar' })}
                                >
                                    Bar Chart
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={node.attrs.type === 'line' ? 'default' : 'outline'} 
                                    onClick={() => updateAttributes({ type: 'line' })}
                                >
                                    Line Chart
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={node.attrs.type === 'pie' ? 'default' : 'outline'} 
                                    onClick={() => updateAttributes({ type: 'pie' })}
                                >
                                    Pie Chart
                                </Button>
                            </div>
                            <div>
                                <label className="text-xs font-semibold block mb-1">Chart Data (JSON format)</label>
                                <Textarea 
                                    value={rawData}
                                    onChange={(e) => setRawData(e.target.value)}
                                    className="font-mono text-xs min-h-[150px]"
                                    placeholder={'[\n  { "name": "Category", "value": 100 }\n]'}
                                />
                            </div>
                        </div>
                    ) : (
                        renderChart()
                    )}
                </CardContent>
            </Card>
        </NodeViewWrapper>
    )
}
