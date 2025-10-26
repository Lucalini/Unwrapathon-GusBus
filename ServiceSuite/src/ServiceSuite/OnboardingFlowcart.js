import React, { useMemo, useState } from 'react';

/**
 * OnboardingFlowchart Component
 * 
 * Visualizes customer journey through onboarding with fall-off points.
 * Analyzes ticket data to identify where customers encounter issues and drop off.
 * Features:
 * - Visual funnel showing progression through onboarding stages
 * - Identified issues at each stage based on ticket analysis
 * - Drop-off rates and conversion metrics
 * - Issue categorization and frequency
 */

const OnboardingFlowchart = ({ tickets = [] }) => {
  const [selectedStage, setSelectedStage] = useState(null);

  // Define onboarding stages with keywords that indicate stage-related issues
  const ONBOARDING_STAGES = [
    {
      id: 'signup',
      name: 'Sign Up',
      keywords: ['sign up', 'registration', 'register', 'account creation', 'create account', 'email verification', 'password'],
      icon: '👤'
    },
    {
      id: 'profile',
      name: 'Profile Setup',
      keywords: ['profile', 'personal information', 'user info', 'avatar', 'bio', 'settings'],
      icon: '📝'
    },
    {
      id: 'tutorial',
      name: 'Tutorial',
      keywords: ['tutorial', 'guide', 'walkthrough', 'onboarding', 'help', 'instructions', 'getting started'],
      icon: '🎓'
    },
    {
      id: 'first_action',
      name: 'First Action',
      keywords: ['first', 'initial', 'start', 'begin', 'create', 'add', 'upload', 'new'],
      icon: '🚀'
    },
    {
      id: 'integration',
      name: 'Integration',
      keywords: ['integration', 'connect', 'link', 'sync', 'import', 'api', 'third-party'],
      icon: '🔗'
    },
    {
      id: 'subscription',
      name: 'Subscription',
      keywords: ['subscription', 'plan', 'pricing', 'payment', 'upgrade', 'billing', 'premium', 'pro'],
      icon: '💳'
    }
  ];

  // Analyze tickets to categorize by onboarding stage
  const stageAnalysis = useMemo(() => {
    const analysis = ONBOARDING_STAGES.map(stage => {
      // Find tickets related to this stage
      const relatedTickets = tickets.filter(ticket => {
        const text = `${ticket.Summary || ''} ${JSON.stringify(ticket.ChatTranscript || [])}`.toLowerCase();
        return stage.keywords.some(keyword => text.includes(keyword));
      });

      // Calculate metrics
      const negativeTickets = relatedTickets.filter(t => t.SentimentLabel === 'Negative');
      const criticalIssues = relatedTickets.filter(t => 
        t.SentimentScore < -0.7 || t.SentimentLabel === 'Negative'
      );

      // Extract common issues
      const issues = {};
      relatedTickets.forEach(ticket => {
        const summary = ticket.Summary || '';
        // Simple keyword extraction
        stage.keywords.forEach(keyword => {
          if (summary.toLowerCase().includes(keyword)) {
            issues[keyword] = (issues[keyword] || 0) + 1;
          }
        });
      });

      const topIssues = Object.entries(issues)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count }));

      // Calculate drop-off rate (higher negative sentiment = higher drop-off)
      const dropOffRate = relatedTickets.length > 0
        ? (negativeTickets.length / relatedTickets.length) * 100
        : 0;

      // Calculate average sentiment
      const avgSentiment = relatedTickets.length > 0
        ? relatedTickets.reduce((sum, t) => sum + (t.SentimentScore || 0), 0) / relatedTickets.length
        : 0;

      return {
        ...stage,
        ticketCount: relatedTickets.length,
        negativeCount: negativeTickets.length,
        criticalCount: criticalIssues.length,
        dropOffRate: Math.round(dropOffRate),
        avgSentiment: avgSentiment.toFixed(2),
        topIssues,
        tickets: relatedTickets
      };
    });

    // Calculate retention rates (simplified)
    // Assume customers progress through stages sequentially
    let previousCount = tickets.length;
    return analysis.map(stage => {
      const retentionRate = previousCount > 0
        ? ((previousCount - stage.negativeCount) / previousCount) * 100
        : 100;
      
      const result = {
        ...stage,
        retentionRate: Math.round(Math.max(0, retentionRate)),
        customersAtStage: previousCount
      };
      
      previousCount = Math.max(1, previousCount - stage.negativeCount);
      return result;
    });
  }, [tickets]);

  // Calculate funnel metrics
  const funnelMetrics = useMemo(() => {
    const totalCustomers = tickets.length;
    const totalNegativeTickets = tickets.filter(t => t.SentimentLabel === 'Negative').length;
    const overallConversionRate = totalCustomers > 0
      ? ((totalCustomers - totalNegativeTickets) / totalCustomers) * 100
      : 100;

    const mostProblematicStage = stageAnalysis.reduce((max, stage) => 
      stage.dropOffRate > (max?.dropOffRate || 0) ? stage : max
    , stageAnalysis[0]);

    const totalIssues = stageAnalysis.reduce((sum, stage) => sum + stage.ticketCount, 0);

    return {
      totalCustomers,
      overallConversionRate: Math.round(overallConversionRate),
      mostProblematicStage,
      totalIssues
    };
  }, [stageAnalysis, tickets]);

  // Get color based on drop-off rate
  const getStageColor = (dropOffRate) => {
    if (dropOffRate >= 50) return '#dc2626'; // Critical
    if (dropOffRate >= 30) return '#ea580c'; // High
    if (dropOffRate >= 15) return '#ca8a04'; // Medium
    return '#16a34a'; // Low
  };

  // Get stage width based on retention (for funnel visualization)
  const getStageWidth = (retentionRate) => {
    return Math.max(20, retentionRate);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Onboarding Flowchart Analysis</h1>
        <p style={styles.subtitle}>
          Customer journey insights and fall-off point identification
        </p>
      </div>

      {/* Metrics Overview */}
      <div style={styles.metricsSection}>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{funnelMetrics.totalCustomers}</div>
          <div style={styles.metricLabel}>Total Customers</div>
        </div>
        <div style={styles.metricCard}>
          <div style={{...styles.metricValue, color: '#16a34a'}}>
            {funnelMetrics.overallConversionRate}%
          </div>
          <div style={styles.metricLabel}>Retention Rate</div>
        </div>
        <div style={styles.metricCard}>
          <div style={{...styles.metricValue, color: '#dc2626'}}>
            {funnelMetrics.totalIssues}
          </div>
          <div style={styles.metricLabel}>Total Issues</div>
        </div>
        <div style={{...styles.metricCard, ...styles.metricCardHighlight}}>
          <div style={styles.metricValue}>
            {funnelMetrics.mostProblematicStage?.icon} {funnelMetrics.mostProblematicStage?.name}
          </div>
          <div style={styles.metricLabel}>Most Problematic Stage</div>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div style={styles.funnelSection}>
        <h2 style={styles.sectionTitle}>Onboarding Funnel</h2>
        <div style={styles.funnelContainer}>
          {stageAnalysis.map((stage, index) => {
            const width = getStageWidth(stage.retentionRate);
            const color = getStageColor(stage.dropOffRate);
            const isSelected = selectedStage?.id === stage.id;

            return (
              <div key={stage.id} style={styles.funnelStageWrapper}>
                {/* Stage Block */}
                <div
                  style={{
                    ...styles.funnelStage,
                    width: `${width}%`,
                    backgroundColor: color,
                    borderColor: isSelected ? '#1f2937' : color,
                    borderWidth: isSelected ? '3px' : '1px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedStage(isSelected ? null : stage)}
                >
                  <div style={styles.stageIcon}>{stage.icon}</div>
                  <div style={styles.stageName}>{stage.name}</div>
                  <div style={styles.stageMetrics}>
                    <span style={styles.stageMetric}>
                      {stage.customersAtStage} customers
                    </span>
                    <span style={styles.stageMetric}>
                      {stage.retentionRate}% retention
                    </span>
                  </div>
                </div>

                {/* Drop-off indicator */}
                {stage.dropOffRate > 0 && (
                  <div style={styles.dropOffIndicator}>
                    <div style={styles.dropOffArrow}>⬇</div>
                    <div style={styles.dropOffText}>
                      {stage.dropOffRate}% drop-off
                    </div>
                    <div style={styles.dropOffCount}>
                      {stage.negativeCount} issues
                    </div>
                  </div>
                )}

                {/* Connecting line */}
                {index < stageAnalysis.length - 1 && (
                  <div style={styles.connector} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Details */}
      <div style={styles.stagesGrid}>
        {stageAnalysis.map((stage) => {
          const isSelected = selectedStage?.id === stage.id;
          const color = getStageColor(stage.dropOffRate);

          return (
            <div
              key={stage.id}
              style={{
                ...styles.stageCard,
                borderColor: color,
                backgroundColor: isSelected ? '#f9fafb' : '#ffffff',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected 
                  ? '0 8px 16px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => setSelectedStage(isSelected ? null : stage)}
            >
              <div style={styles.stageCardHeader}>
                <div style={styles.stageCardIcon}>{stage.icon}</div>
                <div style={styles.stageCardTitle}>{stage.name}</div>
              </div>

              <div style={styles.stageCardStats}>
                <div style={styles.stageCardStat}>
                  <span style={styles.stageCardStatLabel}>Tickets:</span>
                  <span style={styles.stageCardStatValue}>{stage.ticketCount}</span>
                </div>
                <div style={styles.stageCardStat}>
                  <span style={styles.stageCardStatLabel}>Negative:</span>
                  <span style={{...styles.stageCardStatValue, color: '#dc2626'}}>
                    {stage.negativeCount}
                  </span>
                </div>
                <div style={styles.stageCardStat}>
                  <span style={styles.stageCardStatLabel}>Drop-off:</span>
                  <span style={{...styles.stageCardStatValue, color}}>
                    {stage.dropOffRate}%
                  </span>
                </div>
                <div style={styles.stageCardStat}>
                  <span style={styles.stageCardStatLabel}>Sentiment:</span>
                  <span style={{
                    ...styles.stageCardStatValue,
                    color: stage.avgSentiment >= 0 ? '#16a34a' : '#dc2626'
                  }}>
                    {stage.avgSentiment}
                  </span>
                </div>
              </div>

              {/* Top Issues */}
              {stage.topIssues.length > 0 && (
                <div style={styles.issuesSection}>
                  <div style={styles.issuesSectionTitle}>Top Issues:</div>
                  <div style={styles.issuesList}>
                    {stage.topIssues.map((issue, idx) => (
                      <div key={idx} style={styles.issueItem}>
                        <span style={styles.issueName}>{issue.issue}</span>
                        <span style={styles.issueCount}>×{issue.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Severity indicator */}
              <div style={styles.severityBar}>
                <div
                  style={{
                    ...styles.severityBarFill,
                    width: `${stage.dropOffRate}%`,
                    backgroundColor: color
                  }}
                />
              </div>

              {stage.criticalCount > 0 && (
                <div style={styles.criticalBadge}>
                  ⚠️ {stage.criticalCount} critical issues
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Stage Details Panel */}
      {selectedStage && (
        <div style={styles.detailsPanel}>
          <div style={styles.detailsPanelHeader}>
            <h3 style={styles.detailsPanelTitle}>
              {selectedStage.icon} {selectedStage.name} - Detailed Analysis
            </h3>
            <button
              onClick={() => setSelectedStage(null)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          <div style={styles.detailsContent}>
            <div style={styles.detailsMetrics}>
              <div style={styles.detailMetric}>
                <div style={styles.detailMetricLabel}>Customer Volume</div>
                <div style={styles.detailMetricValue}>
                  {selectedStage.customersAtStage} customers reached this stage
                </div>
              </div>
              <div style={styles.detailMetric}>
                <div style={styles.detailMetricLabel}>Retention Analysis</div>
                <div style={styles.detailMetricValue}>
                  {selectedStage.retentionRate}% retention · {selectedStage.dropOffRate}% drop-off
                </div>
              </div>
              <div style={styles.detailMetric}>
                <div style={styles.detailMetricLabel}>Issue Severity</div>
                <div style={styles.detailMetricValue}>
                  {selectedStage.criticalCount} critical · {selectedStage.negativeCount} negative
                </div>
              </div>
            </div>

            {/* Sample tickets */}
            {selectedStage.tickets.length > 0 && (
              <div style={styles.sampleTickets}>
                <h4 style={styles.sampleTicketsTitle}>Recent Tickets:</h4>
                <div style={styles.ticketsList}>
                  {selectedStage.tickets.slice(0, 5).map((ticket, idx) => (
                    <div key={idx} style={styles.ticketItem}>
                      <div style={styles.ticketHeader}>
                        <span style={styles.ticketId}>#{ticket.ReviewID?.slice(0, 8)}</span>
                        <span
                          style={{
                            ...styles.ticketSentiment,
                            color: ticket.SentimentLabel === 'Negative' ? '#dc2626' : '#6b7280'
                          }}
                        >
                          {ticket.SentimentLabel}
                        </span>
                      </div>
                      <div style={styles.ticketSummary}>{ticket.Summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div style={styles.recommendations}>
              <h4 style={styles.recommendationsTitle}>💡 Recommendations:</h4>
              <ul style={styles.recommendationsList}>
                {selectedStage.dropOffRate >= 50 && (
                  <li style={styles.recommendationItem}>
                    <strong>Critical:</strong> Immediate attention required. Consider A/B testing alternate flows.
                  </li>
                )}
                {selectedStage.dropOffRate >= 30 && (
                  <li style={styles.recommendationItem}>
                    <strong>High Priority:</strong> Review user feedback and simplify this stage.
                  </li>
                )}
                {selectedStage.criticalCount > 5 && (
                  <li style={styles.recommendationItem}>
                    <strong>Bug Investigation:</strong> Multiple critical issues detected. Technical review needed.
                  </li>
                )}
                {selectedStage.topIssues.length > 0 && (
                  <li style={styles.recommendationItem}>
                    <strong>Common Issues:</strong> Focus on "{selectedStage.topIssues[0].issue}" - appears {selectedStage.topIssues[0].count} times.
                  </li>
                )}
                {selectedStage.avgSentiment < -0.5 && (
                  <li style={styles.recommendationItem}>
                    <strong>UX Improvement:</strong> Low sentiment score indicates poor user experience.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>Drop-off Rate Legend:</h4>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#16a34a'}} />
            <span style={styles.legendText}>Low (&lt;15%)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#ca8a04'}} />
            <span style={styles.legendText}>Medium (15-29%)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#ea580c'}} />
            <span style={styles.legendText}>High (30-49%)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#dc2626'}} />
            <span style={styles.legendText}>Critical (≥50%)</span>
          </div>
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
    marginBottom: '30px',
    textAlign: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280'
  },
  metricsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  metricCardHighlight: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  funnelSection: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '25px'
  },
  funnelContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px 0'
  },
  funnelStageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    position: 'relative'
  },
  funnelStage: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid',
    color: '#ffffff',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    maxWidth: '600px'
  },
  stageIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  stageName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  stageMetrics: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    fontSize: '13px',
    opacity: 0.9
  },
  stageMetric: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  dropOffIndicator: {
    marginTop: '10px',
    textAlign: 'center'
  },
  dropOffArrow: {
    fontSize: '24px',
    color: '#dc2626'
  },
  dropOffText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#dc2626'
  },
  dropOffCount: {
    fontSize: '12px',
    color: '#6b7280'
  },
  connector: {
    width: '2px',
    height: '20px',
    backgroundColor: '#d1d5db',
    margin: '5px 0'
  },
  stagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  stageCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  stageCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px'
  },
  stageCardIcon: {
    fontSize: '28px'
  },
  stageCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },
  stageCardStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '15px'
  },
  stageCardStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  stageCardStatLabel: {
    color: '#6b7280'
  },
  stageCardStatValue: {
    fontWeight: '600',
    color: '#1f2937'
  },
  issuesSection: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb'
  },
  issuesSectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  issuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  issueItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    fontSize: '13px'
  },
  issueName: {
    color: '#374151',
    flex: 1
  },
  issueCount: {
    fontWeight: '600',
    color: '#6b7280',
    fontSize: '12px'
  },
  severityBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '15px'
  },
  severityBarFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  criticalBadge: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'center'
  },
  detailsPanel: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    border: '2px solid #3b82f6'
  },
  detailsPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  detailsPanelTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  closeButton: {
    padding: '8px 12px',
    fontSize: '18px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  detailsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  detailsMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  detailMetric: {
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  detailMetricLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailMetricValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
  },
  sampleTickets: {
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  sampleTicketsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '15px'
  },
  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  ticketItem: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  ticketId: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#6b7280'
  },
  ticketSentiment: {
    fontSize: '12px',
    fontWeight: '600'
  },
  ticketSummary: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.4'
  },
  recommendations: {
    padding: '20px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  },
  recommendationsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  recommendationsList: {
    margin: 0,
    paddingLeft: '20px'
  },
  recommendationItem: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
    lineHeight: '1.5'
  },
  legend: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  legendItems: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendColor: {
    width: '24px',
    height: '24px',
    borderRadius: '4px'
  },
  legendText: {
    fontSize: '13px',
    color: '#374151'
  }
};

export default OnboardingFlowchart;

