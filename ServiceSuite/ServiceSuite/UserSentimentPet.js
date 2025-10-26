import React, { useState, useEffect } from 'react';

/**
 * UserSentimentPet Component
 * 
 * Visualizes app health based on ticket sentiment data using a pet animation.
 * - 5 health stages: Critical (0-19), Poor (20-39), Fair (40-59), Good (60-79), Excellent (80-100)
 * - Each stage has 5 animation frames cycling through different pet expressions
 * - Health score calculated from average sentiment across all tickets
 * - Animation frames map to image files: Critical, Distraught, Sad, Medium, Happy (1-5)
 */

const UserSentimentPet = ({ tickets = [] }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [healthScore, setHealthScore] = useState(100);
  const [healthStage, setHealthStage] = useState('excellent');

  // Health stage configurations
  const HEALTH_STAGES = {
    critical: {
      name: 'Critical',
      range: [0, 19],
      color: '#dc2626',
      backgroundColor: '#fee2e2',
      description: 'App health is critical! Immediate attention required.',
      framePrefix: 'Critical'
    },
    poor: {
      name: 'Poor',
      range: [20, 39],
      color: '#ea580c',
      backgroundColor: '#ffedd5',
      description: 'App health is poor. Multiple issues detected.',
      framePrefix: 'Distraught'
    },
    fair: {
      name: 'Fair',
      range: [40, 59],
      color: '#ca8a04',
      backgroundColor: '#fef3c7',
      description: 'App health is fair. Some improvements needed.',
      framePrefix: 'Sad'
    },
    good: {
      name: 'Good',
      range: [60, 79],
      color: '#16a34a',
      backgroundColor: '#dcfce7',
      description: 'App health is good. Minor issues to address.',
      framePrefix: 'Medium'
    },
    excellent: {
      name: 'Excellent',
      range: [80, 100],
      color: '#0891b2',
      backgroundColor: '#cffafe',
      description: 'App health is excellent! Keep up the great work.',
      framePrefix: 'Happy'
    }
  };

  // Calculate health score from tickets
  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setHealthScore(100);
      return;
    }

    // Calculate average sentiment score
    // SentimentScore is typically -1 to 1, convert to 0-100 scale
    const totalSentiment = tickets.reduce((sum, ticket) => {
      return sum + (ticket.SentimentScore || 0);
    }, 0);
    
    const avgSentiment = totalSentiment / tickets.length;
    
    // Convert from -1 to 1 scale to 0-100 scale
    // -1 = 0 (critical), 0 = 50 (fair), 1 = 100 (excellent)
    const score = Math.round(((avgSentiment + 1) / 2) * 100);
    
    // Additional factors that decrease health score
    const recentNegativeTickets = tickets.filter(t => {
      const hoursSinceReview = (Date.now() - new Date(t.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
      return hoursSinceReview < 24 && t.SentimentLabel === 'Negative';
    }).length;
    
    // Decrease score based on recent negative tickets (up to 20 points)
    const recentNegativePenalty = Math.min(recentNegativeTickets * 3, 20);
    
    const finalScore = Math.max(0, Math.min(100, score - recentNegativePenalty));
    setHealthScore(finalScore);
  }, [tickets]);

  // Determine health stage based on score
  useEffect(() => {
    let stage = 'excellent';
    
    for (const [key, config] of Object.entries(HEALTH_STAGES)) {
      if (healthScore >= config.range[0] && healthScore <= config.range[1]) {
        stage = key;
        break;
      }
    }
    
    setHealthStage(stage);
  }, [healthScore]);

  // Animation frame cycling (5 frames per stage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 5);
    }, 500); // Change frame every 500ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Get current frame image path
  const getImagePath = () => {
    const stage = HEALTH_STAGES[healthStage];
    // Images are in src/images/ directory
    try {
      return require(`../images/${stage.framePrefix}${currentFrame + 1}.png`);
    } catch (error) {
      console.error(`Failed to load image: ${stage.framePrefix}${currentFrame + 1}.png`, error);
      return null;
    }
  };

  // Get ticket statistics
  const getTicketStats = () => {
    if (!tickets || tickets.length === 0) {
      return {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0
      };
    }

    return {
      total: tickets.length,
      positive: tickets.filter(t => t.SentimentLabel === 'Positive').length,
      neutral: tickets.filter(t => t.SentimentLabel === 'Neutral').length,
      negative: tickets.filter(t => t.SentimentLabel === 'Negative').length
    };
  };

  const stats = getTicketStats();
  const currentStageConfig = HEALTH_STAGES[healthStage];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>App Health Monitor</h2>
        
        {/* Pet Animation Display */}
        <div 
          style={{
            ...styles.petContainer,
            backgroundColor: currentStageConfig.backgroundColor
          }}
        >
          <div style={styles.petImageWrapper}>
            {/* Placeholder for pet image - will be replaced with actual images */}
            <div style={{
              ...styles.petPlaceholder,
              borderColor: currentStageConfig.color
            }}>
              <div style={{
                ...styles.petIcon,
                color: currentStageConfig.color
              }}>
                {healthStage === 'excellent' && '🐕'}
                {healthStage === 'good' && '🐶'}
                {healthStage === 'fair' && '😐'}
                {healthStage === 'poor' && '😟'}
                {healthStage === 'critical' && '😰'}
              </div>
              <div style={styles.frameIndicator}>
                Frame {currentFrame + 1}/5
              </div>
            </div>
            {getImagePath() && (
              <img 
                src={getImagePath()} 
                alt={`Pet ${healthStage} animation frame ${currentFrame + 1}`}
                style={styles.petImage}
                onError={(e) => {
                  // Hide broken image if not loaded yet
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        {/* Health Score Display */}
        <div style={styles.scoreSection}>
          <div style={styles.scoreLabel}>Health Score</div>
          <div 
            style={{
              ...styles.scoreValue,
              color: currentStageConfig.color
            }}
          >
            {healthScore}
          </div>
          
          {/* Health Bar */}
          <div style={styles.healthBarContainer}>
            <div 
              style={{
                ...styles.healthBarFill,
                width: `${healthScore}%`,
                backgroundColor: currentStageConfig.color
              }}
            />
          </div>
          
          <div 
            style={{
              ...styles.statusBadge,
              backgroundColor: currentStageConfig.backgroundColor,
              color: currentStageConfig.color
            }}
          >
            {currentStageConfig.name}
          </div>
          
          <div style={styles.description}>
            {currentStageConfig.description}
          </div>
        </div>

        {/* Ticket Statistics */}
        <div style={styles.statsSection}>
          <h3 style={styles.statsTitle}>Ticket Overview</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tickets</div>
            </div>
            <div style={{...styles.statCard, ...styles.statPositive}}>
              <div style={styles.statValue}>{stats.positive}</div>
              <div style={styles.statLabel}>Positive</div>
            </div>
            <div style={{...styles.statCard, ...styles.statNeutral}}>
              <div style={styles.statValue}>{stats.neutral}</div>
              <div style={styles.statLabel}>Neutral</div>
            </div>
            <div style={{...styles.statCard, ...styles.statNegative}}>
              <div style={styles.statValue}>{stats.negative}</div>
              <div style={styles.statLabel}>Negative</div>
            </div>
          </div>
        </div>

        {/* Health Stage Legend */}
        <div style={styles.legendSection}>
          <h4 style={styles.legendTitle}>Health Stages</h4>
          <div style={styles.legendGrid}>
            {Object.entries(HEALTH_STAGES).map(([key, config]) => (
              <div 
                key={key}
                style={{
                  ...styles.legendItem,
                  opacity: key === healthStage ? 1 : 0.5,
                  borderLeft: `4px solid ${config.color}`
                }}
              >
                <div style={styles.legendName}>{config.name}</div>
                <div style={styles.legendRange}>
                  {config.range[0]}-{config.range[1]}
                </div>
              </div>
            ))}
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#1f2937'
  },
  petContainer: {
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '30px',
    transition: 'background-color 0.5s ease'
  },
  petImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  petImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain'
  },
  petPlaceholder: {
    width: '200px',
    height: '200px',
    border: '4px dashed',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  petIcon: {
    fontSize: '80px',
    marginBottom: '10px'
  },
  frameIndicator: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '10px'
  },
  scoreSection: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  scoreValue: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  healthBarContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '15px'
  },
  healthBarFill: {
    height: '100%',
    transition: 'width 0.5s ease, background-color 0.5s ease',
    borderRadius: '6px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  statsSection: {
    marginBottom: '30px'
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1f2937'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  statCard: {
    backgroundColor: '#f9fafb',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statPositive: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  statNeutral: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563'
  },
  statNegative: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  legendSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px'
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px'
  },
  legendItem: {
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#f9fafb',
    transition: 'opacity 0.3s ease'
  },
  legendName: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '2px'
  },
  legendRange: {
    fontSize: '10px',
    color: '#6b7280'
  }
};

export default UserSentimentPet;

