import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import UserSentimentPet from './UserSentimentPet';
import TicketingWindow from './TicketingWindow';
import OnboardingFlowchart from './OnboardingFlowchart';

/**
 * Main App Component for Customer Service Suite
 * 
 * Integrates all three main components:
 * - UserSentimentPet: App health visualization
 * - TicketingWindow: Ticket management and ToDos
 * - OnboardingFlowchart: Customer journey analysis
 */

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState('60000');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch tickets from DynamoDB backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tickets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data.tickets || data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Load mock data for development
  const loadMockData = () => {
    const mockTickets = generateMockTickets(50);
    setTickets(mockTickets);
  };

  // Initial load
  useEffect(() => {
    fetchTickets();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTickets();
    }, parseInt(refreshInterval));

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              🚌 Customer Service Suite
            </h1>
            <p className="text-sm text-muted-foreground">GusBus Unwrapathon Project</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                Auto-refresh
              </label>
            </div>
            
            <Select value={refreshInterval} onValueChange={setRefreshInterval} disabled={!autoRefresh}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30000">30s</SelectItem>
                <SelectItem value="60000">1m</SelectItem>
                <SelectItem value="300000">5m</SelectItem>
                <SelectItem value="600000">10m</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={fetchTickets}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 sm:px-8 py-6">
        {loading && tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : error && tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold">Error Loading Data</h2>
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground">Using mock data for development.</p>
            <Button onClick={fetchTickets}>Try Again</Button>
          </div>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard">
                <span className="mr-2">📊</span>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <span className="mr-2">🎫</span>
                Tickets
              </TabsTrigger>
              <TabsTrigger value="onboarding">
                <span className="mr-2">🔄</span>
                Onboarding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <UserSentimentPet tickets={tickets} />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                      <CardDescription>Overview of all tickets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <StatCard
                          label="Total Tickets"
                          value={tickets.length}
                          icon="🎫"
                          color="bg-blue-500"
                        />
                        <StatCard
                          label="Negative"
                          value={tickets.filter(t => t.SentimentLabel === 'Negative').length}
                          icon="😞"
                          color="bg-red-500"
                        />
                        <StatCard
                          label="Positive"
                          value={tickets.filter(t => t.SentimentLabel === 'Positive').length}
                          icon="😊"
                          color="bg-green-500"
                        />
                        <StatCard
                          label="Paying Customers"
                          value={tickets.filter(t => t.CustomerStatus?.IsPayingCustomer).length}
                          icon="💳"
                          color="bg-yellow-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-6">
              <TicketingWindow tickets={tickets} />
            </TabsContent>

            <TabsContent value="onboarding" className="mt-6">
              <OnboardingFlowchart tickets={tickets} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container px-4 sm:px-8">
          <p className="text-sm text-center text-muted-foreground">
            Last updated: {new Date().toLocaleString()} · {tickets.length} tickets loaded
          </p>
        </div>
      </footer>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, color }) => (
  <div className={`flex items-center gap-4 rounded-lg border p-4 border-l-4 ${color}`}>
    <div className="text-4xl">{icon}</div>
    <div className="flex-1">
      <div className={`text-3xl font-bold ${color.replace('bg-', 'text-')}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

// Utility function to generate mock tickets for testing
const generateMockTickets = (count) => {
  const sentiments = ['Positive', 'Neutral', 'Negative'];
  const subscriptions = ['Free', 'Premium', 'Pro'];
  const cities = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Sydney'];
  const countries = ['USA', 'USA', 'UK', 'Japan', 'Germany', 'Australia'];
  
  const summaries = [
    'Unable to complete sign up process',
    'Profile setup is confusing',
    'Tutorial was very helpful',
    'First action button not working',
    'Integration with third-party service failed',
    'Payment processing error',
    'Great onboarding experience',
    'Having trouble connecting my account',
    'The walkthrough guide is excellent',
    'Cannot find the settings menu',
    'Subscription upgrade process unclear',
    'Love the new features',
    'App crashes during tutorial',
    'Email verification not working',
    'Premium features are worth it'
  ];

  return Array.from({ length: count }, (_, i) => {
    const sentimentLabel = sentiments[Math.floor(Math.random() * sentiments.length)];
    const sentimentScore = sentimentLabel === 'Positive' 
      ? Math.random() * 0.5 + 0.5
      : sentimentLabel === 'Negative'
      ? Math.random() * -0.5 - 0.5
      : Math.random() * 0.4 - 0.2;
    
    const subscriptionLevel = subscriptions[Math.floor(Math.random() * subscriptions.length)];
    const cityIndex = Math.floor(Math.random() * cities.length);
    
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      PK: `CUSTOMER#${1000 + i}`,
      SK: `REVIEW#${timestamp}`,
      CustomerID: `CUST-${1000 + i}`,
      ReviewID: `REV-${10000 + i}-${Date.now()}`,
      ReviewTimestamp: timestamp,
      SentimentScore: sentimentScore,
      SentimentLabel: sentimentLabel,
      Summary: summaries[Math.floor(Math.random() * summaries.length)],
      CustomerStatus: {
        SubscriptionLevel: subscriptionLevel,
        IsPayingCustomer: subscriptionLevel !== 'Free'
      },
      CustomerLocation: {
        City: cities[cityIndex],
        Country: countries[cityIndex]
      },
      ChatTranscript: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, j) => ({
        Sender: j % 2 === 0 ? 'Customer' : 'Support',
        Timestamp: new Date(Date.now() - j * 60000).toISOString(),
        Text: `Message ${j + 1}`
      })),
      RecentPageVisits: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, j) => ({
        URL: `https://example.com/page${j}`,
        VisitTime: new Date(Date.now() - j * 120000).toISOString(),
        FullPageHTML: '<html>...</html>'
      }))
    };
  });
};

export default App;

