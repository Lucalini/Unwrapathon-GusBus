import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, CheckCircle2, Circle } from 'lucide-react';

/**
 * TicketingWindow Component
 * 
 * Creates and manages ToDos based on customer tickets with advanced sorting and filtering.
 */

const TicketingWindow = ({ tickets = [] }) => {
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterCustomerType, setFilterCustomerType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTodos, setCompletedTodos] = useState(new Set());

  // Calculate severity and priority for each ticket
  const enrichedTickets = useMemo(() => {
    return tickets.map(ticket => {
      const sentimentScore = ticket.SentimentScore || 0;
      const isPayingCustomer = ticket.CustomerStatus?.IsPayingCustomer || false;
      
      let severity = 'low';
      if (sentimentScore < -0.7) severity = 'critical';
      else if (sentimentScore < -0.4) severity = 'high';
      else if (sentimentScore < 0) severity = 'medium';
      
      if (isPayingCustomer && severity === 'medium') severity = 'high';
      else if (isPayingCustomer && severity === 'high') severity = 'critical';
      
      let priorityScore = 50 + Math.abs(sentimentScore) * 40;
      if (isPayingCustomer) priorityScore += 20;
      
      const hoursSinceReview = (Date.now() - new Date(ticket.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
      if (hoursSinceReview < 24) priorityScore += 15;
      else if (hoursSinceReview < 72) priorityScore += 10;
      else if (hoursSinceReview < 168) priorityScore += 5;
      
      return { ...ticket, severity, priorityScore: Math.min(100, Math.max(0, priorityScore)) };
    });
  }, [tickets]);

  // Apply filters and sorting
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = enrichedTickets;
    
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.SentimentLabel?.toLowerCase() === filterSentiment.toLowerCase()
      );
    }
    
    if (filterCustomerType === 'paying') {
      filtered = filtered.filter(ticket => ticket.CustomerStatus?.IsPayingCustomer === true);
    } else if (filterCustomerType === 'free') {
      filtered = filtered.filter(ticket => ticket.CustomerStatus?.IsPayingCustomer === false);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.CustomerID?.toLowerCase().includes(query) ||
        ticket.Summary?.toLowerCase().includes(query) ||
        ticket.CustomerLocation?.City?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'priority':
          comparison = b.priorityScore - a.priorityScore;
          break;
        case 'sentiment':
          comparison = a.SentimentScore - b.SentimentScore;
          break;
        case 'timestamp':
          comparison = new Date(b.ReviewTimestamp) - new Date(a.ReviewTimestamp);
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [enrichedTickets, sortBy, sortOrder, filterSentiment, filterCustomerType, searchQuery]);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get sentiment color
  const getSentimentColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-gray-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Statistics
  const stats = {
    total: tickets.length,
    filtered: filteredAndSortedTickets.length,
    critical: enrichedTickets.filter(t => t.severity === 'critical').length,
    high: enrichedTickets.filter(t => t.severity === 'high').length,
    completed: completedTodos.size,
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.high}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-xs font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                  <SelectItem value="timestamp">Date</SelectItem>
                  <SelectItem value="severity">Severity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Order</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Sentiment</label>
              <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Customer</label>
              <Select value={filterCustomerType} onValueChange={setFilterCustomerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paying">Paying</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                />
                <label
                  htmlFor="show-completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Completed
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets ({stats.filtered})</CardTitle>
              <CardDescription>Manage and track customer support tickets</CardDescription>
            </div>
            {selectedTickets.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedTickets.forEach(id => completedTodos.add(id));
                    setCompletedTodos(new Set(completedTodos));
                    setSelectedTickets(new Set());
                  }}
                >
                  Mark {selectedTickets.size} as Complete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTickets(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tickets found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedTickets
                .filter(ticket => showCompleted || !completedTodos.has(ticket.ReviewID))
                .map((ticket) => {
                  const isCompleted = completedTodos.has(ticket.ReviewID);
                  const isSelected = selectedTickets.has(ticket.ReviewID);
                  
                  return (
                    <div
                      key={ticket.ReviewID}
                      className={`p-4 rounded-lg border-l-4 ${
                        ticket.severity === 'critical' ? 'border-l-red-500' :
                        ticket.severity === 'high' ? 'border-l-orange-500' :
                        ticket.severity === 'medium' ? 'border-l-yellow-500' :
                        'border-l-green-500'
                      } ${isCompleted ? 'opacity-60 bg-muted' : 'bg-card'} border`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            const newSelected = new Set(selectedTickets);
                            if (newSelected.has(ticket.ReviewID)) {
                              newSelected.delete(ticket.ReviewID);
                            } else {
                              newSelected.add(ticket.ReviewID);
                            }
                            setSelectedTickets(newSelected);
                          }}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              #{ticket.ReviewID?.slice(0, 8)}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(ticket.ReviewTimestamp)}
                            </span>
                            {ticket.CustomerStatus?.IsPayingCustomer && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                💳 Paying
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              📍 {ticket.CustomerLocation?.City}, {ticket.CustomerLocation?.Country}
                            </span>
                          </div>

                          <p className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                            {isCompleted && <CheckCircle2 className="inline h-4 w-4 mr-1 text-green-600" />}
                            {ticket.Summary || 'No summary available'}
                          </p>

                          <div className="flex gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Priority:</span>
                              <span className="font-semibold">{Math.round(ticket.priorityScore)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Severity:</span>
                              <Badge className={getSeverityColor(ticket.severity)}>
                                {ticket.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Sentiment:</span>
                              <span className={`font-semibold ${getSentimentColor(ticket.SentimentLabel)}`}>
                                {ticket.SentimentLabel} ({ticket.SentimentScore?.toFixed(2)})
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>💬 {ticket.ChatTranscript?.length || 0} messages</span>
                            <span>🔗 {ticket.RecentPageVisits?.length || 0} page visits</span>
                            <span>👤 {ticket.CustomerStatus?.SubscriptionLevel || 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                              const newCompleted = new Set(completedTodos);
                              if (newCompleted.has(ticket.ReviewID)) {
                                newCompleted.delete(ticket.ReviewID);
                              } else {
                                newCompleted.add(ticket.ReviewID);
                              }
                              setCompletedTodos(newCompleted);
                            }}
                          >
                            {isCompleted ? <Circle className="h-4 w-4 mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                            {isCompleted ? 'Reopen' : 'Complete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketingWindow;

