import React, { useState, useEffect } from 'react';
import UserSentimentPet from './UserSentimentPet';
import TicketingWindow from './TicketingWindow';
import OnboardingFlowchart from './OnboardingFlowcart';

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
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, tickets, flowchart
  const [refreshInterval, setRefreshInterval] = useState(60000); // 60 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch tickets from DynamoDB backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      // This is a placeholder that demonstrates the structure
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
      
      // Load mock data for development/testing
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
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'tickets', name: 'Tickets', icon: '🎫' },
    { id: 'flowchart', name: 'Onboarding', icon: '🔄' }
  ];

  // Render active view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={styles.dashboardGrid}>
            <div style={styles.dashboardSection}>
              <UserSentimentPet tickets={tickets} />
            </div>
            <div style={styles.dashboardSection}>
              <div style={styles.quickStats}>
                <h2 style={styles.quickStatsTitle}>Quick Stats</h2>
                <div style={styles.statsGrid}>
                  <StatCard
                    label="Total Tickets"
                    value={tickets.length}
                    icon="🎫"
                    color="#3b82f6"
                  />
                  <StatCard
                    label="Negative"
                    value={tickets.filter(t => t.SentimentLabel === 'Negative').length}
                    icon="😞"
                    color="#dc2626"
                  />
                  <StatCard
                    label="Positive"
                    value={tickets.filter(t => t.SentimentLabel === 'Positive').length}
                    icon="😊"
                    color="#16a34a"
                  />
                  <StatCard
                    label="Paying Customers"
                    value={tickets.filter(t => t.CustomerStatus?.IsPayingCustomer).length}
                    icon="💳"
                    color="#f59e0b"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'tickets':
        return <TicketingWindow tickets={tickets} />;
      case 'flowchart':
        return <OnboardingFlowchart tickets={tickets} />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.appTitle}>🚌 Customer Service Suite</h1>
            <p style={styles.appSubtitle}>GusBus Unwrapathon Project</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.refreshControls}>
              <label style={styles.refreshLabel}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  style={styles.checkbox}
                />
                Auto-refresh
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
                style={styles.select}
              >
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
                <option value={600000}>10m</option>
              </select>
              <button
                onClick={fetchTickets}
                style={styles.refreshButton}
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={styles.nav}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                ...styles.navTab,
                ...(activeView === tab.id ? styles.navTabActive : {})
              }}
            >
              <span style={styles.navTabIcon}>{tab.icon}</span>
              <span style={styles.navTabText}>{tab.name}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {loading && tickets.length === 0 ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading tickets...</p>
          </div>
        ) : error && tickets.length === 0 ? (
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Error Loading Data</h2>
            <p style={styles.errorMessage}>{error}</p>
            <p style={styles.errorHint}>Using mock data for development.</p>
            <button onClick={fetchTickets} style={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : (
          renderView()
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Last updated: {new Date().toLocaleString()} · {tickets.length} tickets loaded
        </p>
      </footer>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, color }) => (
  <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statContent}>
      <div style={{...styles.statValue, color}}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
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

// Styles
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f3f4f6',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #e5e7eb'
  },
  headerLeft: {
    flex: 1
  },
  appTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
    marginBottom: '5px'
  },
  appSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  refreshControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  refreshLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  select: {
    padding: '6px 10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  refreshButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  nav: {
    display: 'flex',
    padding: '0 30px',
    gap: '5px'
  },
  navTab: {
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  navTabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  navTabIcon: {
    fontSize: '18px'
  },
  navTabText: {
    fontSize: '15px'
  },
  main: {
    flex: 1,
    padding: '0',
    overflow: 'auto'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '40px'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px'
  },
  errorMessage: {
    fontSize: '16px',
    color: '#dc2626',
    marginBottom: '10px'
  },
  errorHint: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '500',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '20px',
    padding: '20px'
  },
  dashboardSection: {
    minHeight: '400px'
  },
  quickStats: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: '100%'
  },
  quickStatsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    borderLeft: '4px solid'
  },
  statIcon: {
    fontSize: '32px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280'
  },
  footer: {
    padding: '15px 30px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default App;

