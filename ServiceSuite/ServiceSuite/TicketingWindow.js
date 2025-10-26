import React, { useState, useMemo } from 'react';

/**
 * TicketingWindow Component
 * 
 * Creates and manages ToDos based on customer tickets with advanced sorting and filtering.
 * Features:
 * - Sort by sentiment, severity, frequency, timestamp
 * - Filter by sentiment label, customer status, location
 * - Create actionable ToDos from tickets
 * - Priority scoring based on multiple factors
 */

const TicketingWindow = ({ tickets = [] }) => {
  const [sortBy, setSortBy] = useState('priority'); // priority, sentiment, timestamp, severity
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [filterSentiment, setFilterSentiment] = useState('all'); // all, positive, neutral, negative
  const [filterCustomerType, setFilterCustomerType] = useState('all'); // all, paying, free
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTodos, setCompletedTodos] = useState(new Set());

  // Calculate severity and priority for each ticket
  const enrichedTickets = useMemo(() => {
    return tickets.map(ticket => {
      // Calculate severity based on sentiment score and other factors
      let severity = 'low';
      const sentimentScore = ticket.SentimentScore || 0;
      const isPayingCustomer = ticket.CustomerStatus?.IsPayingCustomer || false;
      
      // Severity calculation
      if (sentimentScore < -0.7) {
        severity = 'critical';
      } else if (sentimentScore < -0.4) {
        severity = 'high';
      } else if (sentimentScore < 0) {
        severity = 'medium';
      }
      
      // Boost severity for paying customers
      if (isPayingCustomer && severity === 'medium') {
        severity = 'high';
      } else if (isPayingCustomer && severity === 'high') {
        severity = 'critical';
      }
      
      // Calculate priority score (0-100)
      let priorityScore = 50;
      
      // Sentiment impact (40 points)
      priorityScore += Math.abs(sentimentScore) * 40;
      
      // Paying customer bonus (20 points)
      if (isPayingCustomer) {
        priorityScore += 20;
      }
      
      // Recency bonus (15 points)
      const hoursSinceReview = (Date.now() - new Date(ticket.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
      if (hoursSinceReview < 24) {
        priorityScore += 15;
      } else if (hoursSinceReview < 72) {
        priorityScore += 10;
      } else if (hoursSinceReview < 168) {
        priorityScore += 5;
      }
      
      // Chat length complexity (10 points)
      const chatLength = ticket.ChatTranscript?.length || 0;
      if (chatLength > 20) {
        priorityScore += 10;
      } else if (chatLength > 10) {
        priorityScore += 5;
      }
      
      // Page visit complexity (15 points)
      const pageVisits = ticket.RecentPageVisits?.length || 0;
      if (pageVisits > 10) {
        priorityScore += 15;
      } else if (pageVisits > 5) {
        priorityScore += 10;
      }
      
      priorityScore = Math.min(100, Math.max(0, priorityScore));
      
      return {
        ...ticket,
        severity,
        priorityScore
      };
    });
  }, [tickets]);

  // Apply filters and sorting
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = enrichedTickets;
    
    // Apply sentiment filter
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(ticket => 
        ticket.SentimentLabel?.toLowerCase() === filterSentiment.toLowerCase()
      );
    }
    
    // Apply customer type filter
    if (filterCustomerType === 'paying') {
      filtered = filtered.filter(ticket => ticket.CustomerStatus?.IsPayingCustomer === true);
    } else if (filterCustomerType === 'free') {
      filtered = filtered.filter(ticket => ticket.CustomerStatus?.IsPayingCustomer === false);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.CustomerID?.toLowerCase().includes(query) ||
        ticket.Summary?.toLowerCase().includes(query) ||
        ticket.CustomerLocation?.City?.toLowerCase().includes(query) ||
        ticket.CustomerLocation?.Country?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
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

  // Group tickets by issue frequency
  const issueFrequency = useMemo(() => {
    const frequency = {};
    tickets.forEach(ticket => {
      const summary = ticket.Summary || 'Unknown Issue';
      // Extract key phrases (simplified)
      const words = summary.toLowerCase().split(' ')
        .filter(word => word.length > 4);
      
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
      });
    });
    
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [tickets]);

  // Toggle ticket selection
  const toggleTicketSelection = (ticketId) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  // Toggle all tickets
  const toggleAllTickets = () => {
    if (selectedTickets.size === filteredAndSortedTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredAndSortedTickets.map(t => t.ReviewID)));
    }
  };

  // Mark ticket as completed
  const toggleCompleted = (ticketId) => {
    const newCompleted = new Set(completedTodos);
    if (newCompleted.has(ticketId)) {
      newCompleted.delete(ticketId);
    } else {
      newCompleted.add(ticketId);
    }
    setCompletedTodos(newCompleted);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  // Get sentiment color
  const getSentimentColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive': return '#16a34a';
      case 'neutral': return '#6b7280';
      case 'negative': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
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
    selected: selectedTickets.size
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Ticket Management</h1>
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{stats.total}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={{...styles.stat, ...styles.statCritical}}>
            <span style={styles.statValue}>{stats.critical}</span>
            <span style={styles.statLabel}>Critical</span>
          </div>
          <div style={{...styles.stat, ...styles.statHigh}}>
            <span style={styles.statValue}>{stats.high}</span>
            <span style={styles.statLabel}>High Priority</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{stats.completed}</span>
            <span style={styles.statLabel}>Completed</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div style={styles.controlsSection}>
        {/* Search */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Filters and Sorting */}
        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="priority">Priority Score</option>
              <option value="sentiment">Sentiment</option>
              <option value="timestamp">Date</option>
              <option value="severity">Severity</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={styles.select}
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Sentiment:</label>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              style={styles.select}
            >
              <option value="all">All</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Customer:</label>
            <select
              value={filterCustomerType}
              onChange={(e) => setFilterCustomerType(e.target.value)}
              style={styles.select}
            >
              <option value="all">All</option>
              <option value="paying">Paying</option>
              <option value="free">Free</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                style={styles.checkbox}
              />
              Show Completed
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTickets.size > 0 && (
          <div style={styles.bulkActions}>
            <span style={styles.bulkActionsText}>
              {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => {
                selectedTickets.forEach(id => {
                  const newCompleted = new Set(completedTodos);
                  newCompleted.add(id);
                  setCompletedTodos(newCompleted);
                });
                setSelectedTickets(new Set());
              }}
              style={styles.bulkActionButton}
            >
              Mark as Complete
            </button>
            <button
              onClick={() => setSelectedTickets(new Set())}
              style={{...styles.bulkActionButton, ...styles.bulkActionButtonSecondary}}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Issue Frequency Section */}
      {issueFrequency.length > 0 && (
        <div style={styles.frequencySection}>
          <h3 style={styles.sectionTitle}>Common Issues (by keyword frequency)</h3>
          <div style={styles.frequencyGrid}>
            {issueFrequency.map(([keyword, count]) => (
              <div key={keyword} style={styles.frequencyItem}>
                <span style={styles.frequencyKeyword}>{keyword}</span>
                <span style={styles.frequencyCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div style={styles.ticketsSection}>
        <div style={styles.ticketsHeader}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filteredAndSortedTickets.length > 0 && selectedTickets.size === filteredAndSortedTickets.length}
              onChange={toggleAllTickets}
              style={styles.checkbox}
            />
            <span style={styles.ticketsCount}>
              {stats.filtered} Ticket{stats.filtered !== 1 ? 's' : ''}
            </span>
          </label>
        </div>

        <div style={styles.ticketsList}>
          {filteredAndSortedTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No tickets found matching your criteria.</p>
            </div>
          ) : (
            filteredAndSortedTickets
              .filter(ticket => showCompleted || !completedTodos.has(ticket.ReviewID))
              .map((ticket) => {
                const isCompleted = completedTodos.has(ticket.ReviewID);
                const isSelected = selectedTickets.has(ticket.ReviewID);
                
                return (
                  <div
                    key={ticket.ReviewID}
                    style={{
                      ...styles.ticketCard,
                      opacity: isCompleted ? 0.6 : 1,
                      borderLeft: `4px solid ${getSeverityColor(ticket.severity)}`
                    }}
                  >
                    <div style={styles.ticketHeader}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTicketSelection(ticket.ReviewID)}
                        style={styles.checkbox}
                      />
                      
                      <div style={styles.ticketMeta}>
                        <span style={styles.ticketId}>#{ticket.ReviewID?.slice(0, 8)}</span>
                        <span style={styles.ticketTime}>{formatDate(ticket.ReviewTimestamp)}</span>
                        
                        {ticket.CustomerStatus?.IsPayingCustomer && (
                          <span style={styles.badgePaying}>💳 Paying</span>
                        )}
                        
                        <span style={styles.ticketLocation}>
                          📍 {ticket.CustomerLocation?.City}, {ticket.CustomerLocation?.Country}
                        </span>
                      </div>
                    </div>

                    <div style={styles.ticketContent}>
                      <div style={styles.ticketSummary}>
                        {isCompleted && <span style={styles.strikethrough}>✓ </span>}
                        {ticket.Summary || 'No summary available'}
                      </div>
                      
                      <div style={styles.ticketMetrics}>
                        <div style={styles.metricBadge}>
                          <span style={styles.metricLabel}>Priority:</span>
                          <span style={styles.metricValue}>
                            {Math.round(ticket.priorityScore)}
                          </span>
                        </div>
                        
                        <div style={styles.metricBadge}>
                          <span style={styles.metricLabel}>Severity:</span>
                          <span
                            style={{
                              ...styles.severityBadge,
                              backgroundColor: getSeverityColor(ticket.severity),
                            }}
                          >
                            {ticket.severity.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={styles.metricBadge}>
                          <span style={styles.metricLabel}>Sentiment:</span>
                          <span
                            style={{
                              ...styles.sentimentBadge,
                              color: getSentimentColor(ticket.SentimentLabel)
                            }}
                          >
                            {ticket.SentimentLabel} ({ticket.SentimentScore?.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      
                      <div style={styles.ticketDetails}>
                        <span style={styles.detailItem}>
                          💬 {ticket.ChatTranscript?.length || 0} messages
                        </span>
                        <span style={styles.detailItem}>
                          🔗 {ticket.RecentPageVisits?.length || 0} page visits
                        </span>
                        <span style={styles.detailItem}>
                          👤 {ticket.CustomerStatus?.SubscriptionLevel || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.ticketActions}>
                      <button
                        onClick={() => toggleCompleted(ticket.ReviewID)}
                        style={{
                          ...styles.actionButton,
                          ...(isCompleted ? styles.actionButtonUncomplete : styles.actionButtonComplete)
                        }}
                      >
                        {isCompleted ? 'Reopen' : 'Complete'}
                      </button>
                      <button style={styles.actionButton}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px'
  },
  statsBar: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  stat: {
    backgroundColor: '#ffffff',
    padding: '15px 20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  statCritical: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  statHigh: {
    backgroundColor: '#ffedd5',
    color: '#9a3412'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    opacity: 0.8
  },
  controlsSection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  searchContainer: {
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none'
  },
  filtersRow: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    outline: 'none',
    cursor: 'pointer'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#374151'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  bulkActions: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  bulkActionsText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginRight: 'auto'
  },
  bulkActionButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  bulkActionButtonSecondary: {
    backgroundColor: '#6b7280'
  },
  frequencySection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '15px'
  },
  frequencyGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  frequencyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '16px',
    fontSize: '14px'
  },
  frequencyKeyword: {
    fontWeight: '500',
    color: '#374151'
  },
  frequencyCount: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#6b7280'
  },
  ticketsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  ticketsHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  ticketsCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  ticketsList: {
    maxHeight: '800px',
    overflowY: 'auto'
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  ticketCard: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  ticketMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: '#6b7280'
  },
  ticketId: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#374151'
  },
  ticketTime: {
    color: '#6b7280'
  },
  ticketLocation: {
    color: '#6b7280'
  },
  badgePaying: {
    padding: '2px 8px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },
  ticketContent: {
    marginLeft: '28px'
  },
  ticketSummary: {
    fontSize: '15px',
    color: '#1f2937',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  strikethrough: {
    color: '#16a34a',
    marginRight: '5px'
  },
  ticketMetrics: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  metricBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px'
  },
  metricLabel: {
    color: '#6b7280',
    fontWeight: '500'
  },
  metricValue: {
    fontWeight: '700',
    color: '#374151'
  },
  severityBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ffffff'
  },
  sentimentBadge: {
    fontWeight: '600'
  },
  ticketDetails: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '10px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  ticketActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    marginLeft: '28px'
  },
  actionButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  actionButtonComplete: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none'
  },
  actionButtonUncomplete: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: 'none'
  }
};

export default TicketingWindow;

