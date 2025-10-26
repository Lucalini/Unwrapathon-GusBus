import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

// Import all pet animation images
import Critical1 from '../images/Critical1.png';
import Critical2 from '../images/Critical2.png';
import Critical3 from '../images/Critical3.png';
import Critical4 from '../images/Critical4.png';
import Critical5 from '../images/Critical5.png';
import Distraught1 from '../images/Distraught1.png';
import Distraught2 from '../images/Distraught2.png';
import Distraught3 from '../images/Distraught3.png';
import Distraught4 from '../images/Distraught4.png';
import Distraught5 from '../images/Distraught5.png';
import Sad1 from '../images/Sad1.png';
import Sad2 from '../images/Sad2.png';
import Sad3 from '../images/Sad3.png';
import Sad4 from '../images/Sad4.png';
import Sad5 from '../images/Sad5.png';
import Medium1 from '../images/Medium1.png';
import Medium2 from '../images/Medium2.png';
import Medium3 from '../images/Medium3.png';
import Medium4 from '../images/Medium4.png';
import Medium5 from '../images/Medium5.png';
import Happy1 from '../images/Happy1.png';
import Happy2 from '../images/Happy2.png';
import Happy3 from '../images/Happy3.png';
import Happy4 from '../images/Happy4.png';
import Happy5 from '../images/Happy5.png';

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

  // Health stage configurations with image arrays
  const HEALTH_STAGES = {
    critical: {
      name: 'Critical',
      range: [0, 19],
      color: 'rgb(220, 38, 38)',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
      description: 'App health is critical! Immediate attention required.',
      frames: [Critical1, Critical2, Critical3, Critical4, Critical5]
    },
    poor: {
      name: 'Poor',
      range: [20, 39],
      color: 'rgb(234, 88, 12)',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-500',
      description: 'App health is poor. Multiple issues detected.',
      frames: [Distraught1, Distraught2, Distraught3, Distraught5, Distraught5]
    },
    fair: {
      name: 'Fair',
      range: [40, 59],
      color: 'rgb(202, 138, 4)',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500',
      description: 'App health is fair. Some improvements needed.',
      frames: [Sad1, Sad2, Sad2, Sad4, Sad5]
    },
    good: {
      name: 'Good',
      range: [60, 79],
      color: 'rgb(22, 163, 74)',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
      description: 'App health is good. Minor issues to address.',
      frames: [Medium1, Medium2, Medium1, Medium2, Medium1]
    },
    excellent: {
      name: 'Excellent',
      range: [80, 100],
      color: 'rgb(8, 145, 178)',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-500',
      description: 'App health is excellent! Keep up the great work.',
      frames: [Happy1, Happy2, Happy3, Happy4, Happy5]
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

  // Animation frame cycling (5 frames per stage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 5);
    }, 500); // Change frame every 500ms for smooth animation
    return () => clearInterval(interval);
  }, []);

  // Get current frame image
  const getCurrentFrameImage = () => {
    const stage = HEALTH_STAGES[healthStage];
    const image = stage.frames[currentFrame];
    console.log('Current health stage:', healthStage, 'Frame:', currentFrame, 'Image:', image);
    return image;
  };

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
          <div className="flex flex-col justify-center items-center min-h-[300px]">
            <img 
              src={getCurrentFrameImage()} 
              alt={`Pet ${healthStage} animation frame ${currentFrame + 1}`}
              className="max-w-full max-h-[250px] object-contain transition-opacity duration-200"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="text-xs text-muted-foreground mt-2">
              Frame {currentFrame + 1}/5
            </div>
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

