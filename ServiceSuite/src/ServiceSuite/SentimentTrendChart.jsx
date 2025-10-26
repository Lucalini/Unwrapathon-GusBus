import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * SentimentTrendChart Component
 * 
 * Displays a line chart showing sentiment trends over time
 * - Green line for average sentiment score
 * - Color-coded zones for sentiment levels
 * - Toggle between real data and mock trend data
 */

const SentimentTrendChart = ({ tickets = [] }) => {
  const [useMockTrendData, setUseMockTrendData] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Generate sentiment trend data from tickets
  useEffect(() => {
    if (useMockTrendData) {
      // Generate mock trend data
      setChartData(generateMockTrendData());
    } else {
      // Use real ticket data
      setChartData(generateRealTrendData(tickets));
    }
  }, [tickets, useMockTrendData]);

  // Generate mock trend data for the last 30 days
  const generateMockTrendData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic sentiment patterns with some variance
      const baseScore = 50 + Math.sin(i / 5) * 15 + Math.random() * 10;
      const sentiment = Math.max(0, Math.min(100, baseScore));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        sentiment: Math.round(sentiment),
        tickets: Math.floor(Math.random() * 15) + 5
      });
    }
    
    return data;
  };

  // Generate trend data from real tickets
  const generateRealTrendData = (tickets) => {
    if (!tickets || tickets.length === 0) {
      return [];
    }

    // Group tickets by date
    const ticketsByDate = {};
    
    tickets.forEach(ticket => {
      const date = new Date(ticket.ReviewTimestamp).toISOString().split('T')[0];
      if (!ticketsByDate[date]) {
        ticketsByDate[date] = [];
      }
      ticketsByDate[date].push(ticket);
    });

    // Calculate average sentiment for each day
    const data = Object.entries(ticketsByDate)
      .map(([date, dayTickets]) => {
        const avgSentiment = dayTickets.reduce((sum, t) => sum + (t.SentimentScore || 0), 0) / dayTickets.length;
        // Convert -1 to 1 scale to 0-100 scale
        const score = Math.round(((avgSentiment + 1) / 2) * 100);
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          sentiment: score,
          tickets: dayTickets.length
        };
      })
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

    return data;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.date}</p>
          <p className="text-sm text-muted-foreground">
            Sentiment: <span className="font-bold" style={{ 
              color: data.sentiment >= 80 ? '#0891b2' : 
                     data.sentiment >= 60 ? '#16a34a' : 
                     data.sentiment >= 40 ? '#ca8a04' : 
                     data.sentiment >= 20 ? '#ea580c' : '#dc2626'
            }}>
              {data.sentiment}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">Tickets: {data.tickets}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>Average sentiment score over time (0-100 scale)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="mock-trend"
              checked={useMockTrendData}
              onCheckedChange={setUseMockTrendData}
            />
            <label htmlFor="mock-trend" className="text-sm cursor-pointer">
              {useMockTrendData ? '📊 Mock Trend' : '📈 Real Trend'}
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Reference lines for sentiment zones */}
                <ReferenceLine y={80} stroke="#0891b2" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={60} stroke="#16a34a" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={40} stroke="#ca8a04" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={20} stroke="#ea580c" strokeDasharray="3 3" strokeOpacity={0.3} />
                
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Sentiment Score"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Sentiment Zone Legend */}
            <div className="mt-4 grid grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-muted-foreground">Critical (0-19)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span className="text-muted-foreground">Poor (20-39)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-muted-foreground">Fair (40-59)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-muted-foreground">Good (60-79)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                <span className="text-muted-foreground">Excellent (80-100)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentTrendChart;

