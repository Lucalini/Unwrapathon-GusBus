/**
 * Utility Functions for Customer Service Suite
 * 
 * Common helper functions used across components
 */

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  
  return date.toLocaleDateString();
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleString('en-US', { ...defaultOptions, ...options });
};

/**
 * Calculate sentiment score from tickets
 * Returns a value between 0-100
 */
export const calculateHealthScore = (tickets) => {
  if (!tickets || tickets.length === 0) return 100;
  
  const totalSentiment = tickets.reduce((sum, ticket) => {
    return sum + (ticket.SentimentScore || 0);
  }, 0);
  
  const avgSentiment = totalSentiment / tickets.length;
  
  // Convert from -1 to 1 scale to 0-100 scale
  const baseScore = ((avgSentiment + 1) / 2) * 100;
  
  // Factor in recent negative tickets
  const recentNegativeTickets = tickets.filter(t => {
    const hoursSinceReview = (Date.now() - new Date(t.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
    return hoursSinceReview < 24 && t.SentimentLabel === 'Negative';
  }).length;
  
  const recentNegativePenalty = Math.min(recentNegativeTickets * 3, 20);
  
  return Math.max(0, Math.min(100, Math.round(baseScore - recentNegativePenalty)));
};

/**
 * Get color based on sentiment score
 */
export const getSentimentColor = (sentimentScore) => {
  if (sentimentScore >= 0.5) return '#16a34a'; // Green
  if (sentimentScore >= 0) return '#ca8a04'; // Yellow
  if (sentimentScore >= -0.5) return '#ea580c'; // Orange
  return '#dc2626'; // Red
};

/**
 * Get color based on sentiment label
 */
export const getSentimentLabelColor = (label) => {
  switch (label?.toLowerCase()) {
    case 'positive': return '#16a34a';
    case 'neutral': return '#6b7280';
    case 'negative': return '#dc2626';
    default: return '#6b7280';
  }
};

/**
 * Calculate priority score for a ticket
 * Returns a value between 0-100
 */
export const calculatePriorityScore = (ticket) => {
  let score = 50;
  
  // Sentiment impact (40 points)
  const sentimentScore = ticket.SentimentScore || 0;
  score += Math.abs(sentimentScore) * 40;
  
  // Paying customer bonus (20 points)
  if (ticket.CustomerStatus?.IsPayingCustomer) {
    score += 20;
  }
  
  // Recency bonus (15 points)
  const hoursSinceReview = (Date.now() - new Date(ticket.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
  if (hoursSinceReview < 24) {
    score += 15;
  } else if (hoursSinceReview < 72) {
    score += 10;
  } else if (hoursSinceReview < 168) {
    score += 5;
  }
  
  // Chat length complexity (10 points)
  const chatLength = ticket.ChatTranscript?.length || 0;
  if (chatLength > 20) {
    score += 10;
  } else if (chatLength > 10) {
    score += 5;
  }
  
  // Page visit complexity (15 points)
  const pageVisits = ticket.RecentPageVisits?.length || 0;
  if (pageVisits > 10) {
    score += 15;
  } else if (pageVisits > 5) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Calculate severity level for a ticket
 */
export const calculateSeverity = (ticket) => {
  const sentimentScore = ticket.SentimentScore || 0;
  const isPayingCustomer = ticket.CustomerStatus?.IsPayingCustomer || false;
  
  let severity = 'low';
  
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
  
  return severity;
};

/**
 * Get color based on severity
 */
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
};

/**
 * Group tickets by a specific field
 */
export const groupTicketsBy = (tickets, field) => {
  return tickets.reduce((groups, ticket) => {
    const key = getNestedValue(ticket, field) || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(ticket);
    return groups;
  }, {});
};

/**
 * Get nested value from object using dot notation
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Sort tickets by multiple criteria
 */
export const sortTickets = (tickets, sortBy, sortOrder = 'desc') => {
  const sorted = [...tickets].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority':
        comparison = calculatePriorityScore(b) - calculatePriorityScore(a);
        break;
      case 'sentiment':
        comparison = (a.SentimentScore || 0) - (b.SentimentScore || 0);
        break;
      case 'timestamp':
        comparison = new Date(b.ReviewTimestamp) - new Date(a.ReviewTimestamp);
        break;
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aSeverity = calculateSeverity(a);
        const bSeverity = calculateSeverity(b);
        comparison = (severityOrder[bSeverity] || 0) - (severityOrder[aSeverity] || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? -comparison : comparison;
  });
  
  return sorted;
};

/**
 * Filter tickets by criteria
 */
export const filterTickets = (tickets, filters) => {
  return tickets.filter(ticket => {
    // Sentiment filter
    if (filters.sentiment && filters.sentiment !== 'all') {
      if (ticket.SentimentLabel?.toLowerCase() !== filters.sentiment.toLowerCase()) {
        return false;
      }
    }
    
    // Customer type filter
    if (filters.customerType === 'paying' && !ticket.CustomerStatus?.IsPayingCustomer) {
      return false;
    }
    if (filters.customerType === 'free' && ticket.CustomerStatus?.IsPayingCustomer) {
      return false;
    }
    
    // Severity filter
    if (filters.severity && filters.severity !== 'all') {
      if (calculateSeverity(ticket) !== filters.severity) {
        return false;
      }
    }
    
    // Search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const searchableText = [
        ticket.CustomerID,
        ticket.Summary,
        ticket.CustomerLocation?.City,
        ticket.CustomerLocation?.Country
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Extract keywords from text
 */
export const extractKeywords = (text, minLength = 4) => {
  if (!text) return [];
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'that', 'this',
    'it', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word));
  
  return words;
};

/**
 * Calculate keyword frequency from tickets
 */
export const calculateKeywordFrequency = (tickets, limit = 20) => {
  const frequency = {};
  
  tickets.forEach(ticket => {
    const text = ticket.Summary || '';
    const keywords = extractKeywords(text);
    
    keywords.forEach(keyword => {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    });
  });
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
};

/**
 * Calculate average metric from tickets
 */
export const calculateAverage = (tickets, field) => {
  if (!tickets || tickets.length === 0) return 0;
  
  const sum = tickets.reduce((total, ticket) => {
    const value = getNestedValue(ticket, field);
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
  
  return sum / tickets.length;
};

/**
 * Get statistics for tickets
 */
export const getTicketStatistics = (tickets) => {
  if (!tickets || tickets.length === 0) {
    return {
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      paying: 0,
      free: 0,
      avgSentiment: 0,
      avgPriority: 0
    };
  }
  
  const stats = {
    total: tickets.length,
    positive: tickets.filter(t => t.SentimentLabel === 'Positive').length,
    neutral: tickets.filter(t => t.SentimentLabel === 'Neutral').length,
    negative: tickets.filter(t => t.SentimentLabel === 'Negative').length,
    paying: tickets.filter(t => t.CustomerStatus?.IsPayingCustomer).length,
    free: tickets.filter(t => !t.CustomerStatus?.IsPayingCustomer).length
  };
  
  // Calculate severity counts
  const severityCounts = tickets.reduce((counts, ticket) => {
    const severity = calculateSeverity(ticket);
    counts[severity] = (counts[severity] || 0) + 1;
    return counts;
  }, {});
  
  stats.critical = severityCounts.critical || 0;
  stats.high = severityCounts.high || 0;
  stats.medium = severityCounts.medium || 0;
  stats.low = severityCounts.low || 0;
  
  // Calculate averages
  stats.avgSentiment = calculateAverage(tickets, 'SentimentScore').toFixed(2);
  stats.avgPriority = Math.round(
    tickets.reduce((sum, t) => sum + calculatePriorityScore(t), 0) / tickets.length
  );
  
  return stats;
};

/**
 * Export tickets to CSV
 */
export const exportToCSV = (tickets, filename = 'tickets.csv') => {
  if (!tickets || tickets.length === 0) {
    console.warn('No tickets to export');
    return;
  }
  
  // Define CSV headers
  const headers = [
    'ReviewID',
    'CustomerID',
    'Timestamp',
    'Sentiment',
    'SentimentScore',
    'Severity',
    'Priority',
    'Summary',
    'Location',
    'Subscription',
    'PayingCustomer'
  ];
  
  // Convert tickets to CSV rows
  const rows = tickets.map(ticket => [
    ticket.ReviewID,
    ticket.CustomerID,
    ticket.ReviewTimestamp,
    ticket.SentimentLabel,
    ticket.SentimentScore,
    calculateSeverity(ticket),
    calculatePriorityScore(ticket),
    `"${(ticket.Summary || '').replace(/"/g, '""')}"`,
    `"${ticket.CustomerLocation?.City}, ${ticket.CustomerLocation?.Country}"`,
    ticket.CustomerStatus?.SubscriptionLevel,
    ticket.CustomerStatus?.IsPayingCustomer ? 'Yes' : 'No'
  ]);
  
  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export default {
  formatRelativeTime,
  formatDate,
  calculateHealthScore,
  getSentimentColor,
  getSentimentLabelColor,
  calculatePriorityScore,
  calculateSeverity,
  getSeverityColor,
  groupTicketsBy,
  getNestedValue,
  sortTickets,
  filterTickets,
  extractKeywords,
  calculateKeywordFrequency,
  calculateAverage,
  getTicketStatistics,
  exportToCSV
};

