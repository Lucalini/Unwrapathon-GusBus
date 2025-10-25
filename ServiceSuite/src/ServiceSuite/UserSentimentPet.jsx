import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

/**
 * UserSentimentPet Component
 * 
 * Visualizes app health based on ticket sentiment data using a pet animation.
 * - 5 health stages: Critical (0-19), Poor (20-39), Fair (40-59), Good (60-79), Excellent (80-100)
 * - Each stage has 4 animation frames
 * - Health score calculated from average sentiment across all tickets
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
      color: 'rgb(220, 38, 38)',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      description: 'App health is critical! Immediate attention required.',
      framePrefix: 'critical'
    },
    poor: {
      name: 'Poor',
      range: [20, 39],
      color: 'rgb(234, 88, 12)',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-500',
      description: 'App health is poor. Multiple issues detected.',
      framePrefix: 'poor'
    },
    fair: {
      name: 'Fair',
      range: [40, 59],
      color: 'rgb(202, 138, 4)',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500',
      description: 'App health is fair. Some improvements needed.',
      framePrefix: 'fair'
    },
    good: {
      name: 'Good',
      range: [60, 79],
      color: 'rgb(22, 163, 74)',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      description: 'App health is good. Minor issues to address.',
      framePrefix: 'good'
    },
    excellent: {
      name: 'Excellent',
      range: [80, 100],
      color: 'rgb(8, 145, 178)',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-500',
      description: 'App health is excellent! Keep up the great work.',
      framePrefix: 'excellent'
    }
  };

  // Calculate health score from tickets
  useEffect(() => {
    if (!tickets || tickets.length === 0) {
      setHealthScore(100);
      return;
    }

    const totalSentiment = tickets.reduce((sum, ticket) => {
      return sum + (ticket.SentimentScore || 0);
    }, 0);
    
    const avgSentiment = totalSentiment / tickets.length;
    const score = Math.round(((avgSentiment + 1) / 2) * 100);
    
    const recentNegativeTickets = tickets.filter(t => {
      const hoursSinceReview = (Date.now() - new Date(t.ReviewTimestamp).getTime()) / (1000 * 60 * 60);
      return hoursSinceReview < 24 && t.SentimentLabel === 'Negative';
    }).length;
    
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

  // Animation frame cycling (4 frames per stage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Get current frame image path
  const getImagePath = () => {
    const stage = HEALTH_STAGES[healthStage];
    return `/assets/pet/${stage.framePrefix}_${currentFrame + 1}.png`;
  };

  // Get ticket statistics
  const getTicketStats = () => {
    if (!tickets || tickets.length === 0) {
      return { total: 0, positive: 0, neutral: 0, negative: 0 };
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
    <Card>
      <CardHeader>
        <CardTitle>App Health Monitor</CardTitle>
        <CardDescription>Real-time sentiment analysis from customer tickets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pet Animation Display */}
        <div className={`rounded-lg p-8 transition-colors ${currentStageConfig.bgColor}`}>
          <div className="flex justify-center items-center min-h-[200px]">
            {/* Placeholder for pet image */}
            <div className={`w-[200px] h-[200px] border-4 border-dashed rounded-lg flex flex-col justify-center items-center bg-white ${currentStageConfig.borderColor}`}>
              <div className="text-8xl mb-2">
                {healthStage === 'excellent' && '🐕'}
                {healthStage === 'good' && '🐶'}
                {healthStage === 'fair' && '😐'}
                {healthStage === 'poor' && '😟'}
                {healthStage === 'critical' && '😰'}
              </div>
              <div className="text-xs text-muted-foreground">
                Frame {currentFrame + 1}/4
              </div>
            </div>
            <img 
              src={getImagePath()} 
              alt={`Pet ${healthStage} animation frame ${currentFrame + 1}`}
              className="max-w-full max-h-[200px] object-contain hidden"
              onLoad={(e) => {
                e.target.classList.remove('hidden');
                e.target.previousSibling.classList.add('hidden');
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Health Score Display */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Health Score
            </div>
            <div className={`text-5xl font-bold ${currentStageConfig.textColor}`}>
              {healthScore}
            </div>
          </div>
          
          {/* Health Bar */}
          <Progress value={healthScore} className="h-3" />
          
          <div className="flex justify-center">
            <Badge 
              className={`${currentStageConfig.bgColor} ${currentStageConfig.textColor} border-0 text-base px-4 py-1`}
            >
              {currentStageConfig.name}
            </Badge>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            {currentStageConfig.description}
          </p>
        </div>

        {/* Ticket Statistics */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Ticket Overview</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-100">
              <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
              <div className="text-xs text-muted-foreground">Positive</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-100">
              <div className="text-2xl font-bold text-gray-600">{stats.neutral}</div>
              <div className="text-xs text-muted-foreground">Neutral</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-100">
              <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
              <div className="text-xs text-muted-foreground">Negative</div>
            </div>
          </div>
        </div>

        {/* Health Stage Legend */}
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Health Stages
          </h4>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(HEALTH_STAGES).map(([key, config]) => (
              <div 
                key={key}
                className={`p-2 rounded border-l-4 ${config.borderColor} ${key === healthStage ? 'bg-muted' : 'bg-background'} transition-opacity ${key === healthStage ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="text-xs font-semibold">{config.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {config.range[0]}-{config.range[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSentimentPet;

