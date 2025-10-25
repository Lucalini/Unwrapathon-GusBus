import React, { useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

/**
 * OnboardingFlowchart Component
 * 
 * Google Charts Sankey visualization of onboarding flow:
 * - Stage 1: Acquisition sources (Instagram, Facebook, TikTok, Reddit, Web Ads, Organic) with different colors and sizes
 * - Stage 2: Total Users aggregation node
 * - Stage 3: Account Creation outcomes (Success in green, Failures in red)
 * - Stage 4: Surf Cam Viewing outcomes (Viewed successfully in blue, Failures in red)
 * - Stage 5: User Plans (Free, Basic, Premium, Enterprise)
 * 
 * Node sizes reflect the number of users at each stage.
 */

const OnboardingFlowchart = ({ tickets = [] }) => {
  // Acquisition sources with different colors and sizes
  const SOURCES = [
    { id: 'instagram', name: 'Instagram', color: '#E4405F', users: 1250 },
    { id: 'facebook', name: 'Facebook', color: '#1877F2', users: 980 },
    { id: 'webads', name: 'Web Ads', color: '#4285F4', users: 750 },
    { id: 'tiktok', name: 'TikTok', color: '#000000', users: 620 },
    { id: 'reddit', name: 'Reddit', color: '#FF4500', users: 450 },
    { id: 'organic', name: 'Organic Search', color: '#34A853', users: 350 }
  ];

  // Account creation outcomes
  const ACCOUNT_OUTCOMES = [
    { id: 'success', name: 'Account Created', color: '#10B981' },
    { id: 'email_error', name: '❌ Email Verification Error', color: '#EF4444' },
    { id: 'too_many_steps', name: '❌ Too Many Steps', color: '#DC2626' }
  ];

  // Surf cam viewing stage outcomes
  const SURFCAM_OUTCOMES = [
    { id: 'viewed', name: 'Viewed a Surf Cam', color: '#0EA5E9' },
    { id: 'too_laggy', name: '❌ App is Too Laggy', color: '#EF4444' },
    { id: 'too_many_ads', name: '❌ Too Many Ads on Surf Cam', color: '#DC2626' }
  ];

  // User plans (final tier)
  const USER_PLANS = [
    { id: 'free', name: 'Free Plan', tier: 'Free', color: '#94A3B8' },
    { id: 'basic', name: 'Basic Plan', tier: 'Basic', color: '#10B981' },
    { id: 'premium', name: 'Premium Plan', tier: 'Premium', color: '#059669' },
    { id: 'enterprise', name: 'Enterprise Plan', tier: 'Pro', color: '#047857' }
  ];

  // Build Sankey data from tickets
  const { sankeyData, flowMetrics } = useMemo(() => {
    // If no tickets, generate realistic mock data
    const totalUsers = tickets.length > 0 ? tickets.length : SOURCES.reduce((sum, s) => sum + s.users, 0);
    
    // Initialize Sankey data with header
    const data = [['From', 'To', 'Weight']];

    // Calculate distribution percentages
    // Assume 75% account creation success, 15% email error, 10% too many steps
    const successRate = 0.75;
    const emailErrorRate = 0.15;
    const tooManyStepsRate = 0.10;

    // Step 1: Sources → Total Users
    let totalFromSources = 0;
    SOURCES.forEach(source => {
      const users = source.users;
      data.push([source.name, 'Total Users', users]);
      totalFromSources += users;
    });

    // Step 2: Total Users → Account Creation Outcomes
    const successfulAccounts = Math.round(totalFromSources * successRate);
    const emailErrors = Math.round(totalFromSources * emailErrorRate);
    const tooManySteps = Math.round(totalFromSources * tooManyStepsRate);

    data.push(['Total Users', 'Account Created', successfulAccounts]);
    data.push(['Total Users', '❌ Email Verification Error', emailErrors]);
    data.push(['Total Users', '❌ Too Many Steps', tooManySteps]);

    // Step 3: Account Created → Surf Cam Viewing Outcomes
    // Assume 80% view surf cam successfully, 12% encounter lag, 8% see too many ads
    const viewedSurfCam = Math.round(successfulAccounts * 0.80);
    const tooLaggy = Math.round(successfulAccounts * 0.12);
    const tooManyAds = successfulAccounts - viewedSurfCam - tooLaggy; // remainder

    data.push(['Account Created', 'Viewed a Surf Cam', viewedSurfCam]);
    data.push(['Account Created', '❌ App is Too Laggy', tooLaggy]);
    data.push(['Account Created', '❌ Too Many Ads on Surf Cam', tooManyAds]);

    // Step 4: Viewed a Surf Cam → User Plans
    // Assume 40% free, 30% basic, 20% premium, 10% enterprise
    const freePlan = Math.round(viewedSurfCam * 0.40);
    const basicPlan = Math.round(viewedSurfCam * 0.30);
    const premiumPlan = Math.round(viewedSurfCam * 0.20);
    const enterprisePlan = viewedSurfCam - freePlan - basicPlan - premiumPlan; // remainder

    data.push(['Viewed a Surf Cam', 'Free Plan', freePlan]);
    data.push(['Viewed a Surf Cam', 'Basic Plan', basicPlan]);
    data.push(['Viewed a Surf Cam', 'Premium Plan', premiumPlan]);
    data.push(['Viewed a Surf Cam', 'Enterprise Plan', enterprisePlan]);

    // Calculate metrics for display
    const sourceMetrics = SOURCES.map(source => ({
      ...source,
      total: source.users,
      percentage: ((source.users / totalFromSources) * 100).toFixed(1)
    }));

    const accountMetrics = [
      { ...ACCOUNT_OUTCOMES[0], count: successfulAccounts, percentage: (successRate * 100).toFixed(1) },
      { ...ACCOUNT_OUTCOMES[1], count: emailErrors, percentage: (emailErrorRate * 100).toFixed(1) },
      { ...ACCOUNT_OUTCOMES[2], count: tooManySteps, percentage: (tooManyStepsRate * 100).toFixed(1) }
    ];

    const surfcamMetrics = [
      { ...SURFCAM_OUTCOMES[0], count: viewedSurfCam, percentage: ((viewedSurfCam / successfulAccounts) * 100).toFixed(1) },
      { ...SURFCAM_OUTCOMES[1], count: tooLaggy, percentage: ((tooLaggy / successfulAccounts) * 100).toFixed(1) },
      { ...SURFCAM_OUTCOMES[2], count: tooManyAds, percentage: ((tooManyAds / successfulAccounts) * 100).toFixed(1) }
    ];

    const planMetrics = [
      { ...USER_PLANS[0], count: freePlan, percentage: ((freePlan / viewedSurfCam) * 100).toFixed(1) },
      { ...USER_PLANS[1], count: basicPlan, percentage: ((basicPlan / viewedSurfCam) * 100).toFixed(1) },
      { ...USER_PLANS[2], count: premiumPlan, percentage: ((premiumPlan / viewedSurfCam) * 100).toFixed(1) },
      { ...USER_PLANS[3], count: enterprisePlan, percentage: ((enterprisePlan / viewedSurfCam) * 100).toFixed(1) }
    ];

    return {
      sankeyData: data,
      flowMetrics: {
        sources: sourceMetrics,
        accounts: accountMetrics,
        surfcam: surfcamMetrics,
        plans: planMetrics,
        totalUsers: totalFromSources,
        successfulAccounts,
        viewedSurfCam
      }
    };
  }, [tickets]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = flowMetrics.totalUsers || 0;
    const successfulAccounts = flowMetrics.successfulAccounts || 0;
    const failed = totalUsers - successfulAccounts;
    const conversionRate = totalUsers > 0 ? Math.round((successfulAccounts / totalUsers) * 100) : 0;

    return {
      totalUsers,
      failed,
      successful: successfulAccounts,
      conversionRate
    };
  }, [flowMetrics]);

  // Google Charts options
  const options = {
    height: 700,
    sankey: {
      node: {
        colors: [
          // Acquisition sources (6 nodes)
          '#E4405F', // Instagram
          '#1877F2', // Facebook
          '#4285F4', // Web Ads
          '#000000', // TikTok
          '#FF4500', // Reddit
          '#34A853', // Organic
          // Total Users aggregation node
          '#64748B', // Gray/Blue for Total Users
          // Account creation outcomes (3 nodes)
          '#10B981', // Account Created (green)
          '#EF4444', // Email Verification Error (red)
          '#DC2626', // Too Many Steps (red)
          // Surf cam viewing outcomes (3 nodes)
          '#0EA5E9', // Viewed a Surf Cam (blue)
          '#EF4444', // App is Too Laggy (red)
          '#DC2626', // Too Many Ads (red)
          // User plans (4 nodes)
          '#94A3B8', // Free Plan (gray)
          '#10B981', // Basic Plan (green)
          '#059669', // Premium Plan (darker green)
          '#047857'  // Enterprise Plan (darkest green)
        ],
        label: {
          fontName: 'Inter, system-ui, sans-serif',
          fontSize: 13,
          color: '#1F2937',
          bold: true
        },
        nodePadding: 25,
        width: 10
      },
      link: {
        colorMode: 'gradient',
        color: {
          fill: '#D1D5DB',
          fillOpacity: 0.5
        }
      },
      iterations: 64
    },
    tooltip: {
      isHtml: true,
      textStyle: {
        fontName: 'Inter, system-ui, sans-serif',
        fontSize: 12
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{stats.totalUsers.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardDescription>Accounts Created</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.successful.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardDescription>Failed Sign-ups</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats.failed.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">
              {stats.conversionRate}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Google Charts Sankey Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Flow Visualization</CardTitle>
          <CardDescription>
            From acquisition sources → Total Users → Account Creation → Surf Cam Viewing → User Plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {sankeyData.length > 1 ? (
              <Chart
                chartType="Sankey"
                width="100%"
                height="700px"
                data={sankeyData}
                options={options}
                loader={
                  <div className="flex items-center justify-center h-[700px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading flowchart...</p>
                    </div>
                  </div>
                }
              />
            ) : (
              <div className="flex items-center justify-center h-[700px] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-2">No Data Available</p>
                  <p className="text-sm text-muted-foreground">
                    Ticket data is loading or no flows to display
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex gap-8 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#E4405F' }}></div>
              <span className="text-sm text-muted-foreground">Acquisition sources (different colors)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">Failed sign-ups (red)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Successful accounts (green)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Node size = user volume</span>
            </div>
          </div>

          {/* How to Read Guide */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📖 How to Read This Chart:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Stage 1:</strong> Acquisition sources (Instagram, Facebook, etc.) flow into "Total Users"</li>
              <li>• <strong>Stage 2:</strong> Total Users split into successful account creation (green) or failures (red)</li>
              <li>• <strong>Stage 3:</strong> Accounts created flow to surf cam viewing (blue) or encounter issues (red)</li>
              <li>• <strong>Stage 4:</strong> Users who viewed a surf cam successfully flow into different user plans</li>
              <li>• <strong>Node size:</strong> Larger nodes = more users</li>
              <li>• <strong>Hover:</strong> Over any flow to see exact user counts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Acquisition Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acquisition Sources</CardTitle>
            <CardDescription>Where users come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowMetrics.sources.map(source => (
                <div 
                  key={source.id} 
                  className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">{source.total.toLocaleString()}</Badge>
                    <span className="text-xs text-muted-foreground">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Creation Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Creation</CardTitle>
            <CardDescription>Sign-up success vs failures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowMetrics.accounts.map(account => (
                <div 
                  key={account.id} 
                  className={`flex items-center justify-between p-2 rounded transition-colors ${
                    account.id === 'success' 
                      ? 'hover:bg-green-50' 
                      : 'hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="text-sm font-medium">{account.name}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge 
                      variant="outline"
                      className={account.id === 'success' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}
                    >
                      {account.count.toLocaleString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{account.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Surf Cam Viewing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-500">🌊 Surf Cam Viewing</CardTitle>
            <CardDescription>Engagement with surf cam feature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowMetrics.surfcam.map(surfcam => (
                <div 
                  key={surfcam.id} 
                  className={`flex items-center justify-between p-2 rounded transition-colors ${
                    surfcam.id === 'viewed' 
                      ? 'hover:bg-blue-50' 
                      : 'hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: surfcam.color }}
                    />
                    <span className="text-sm font-medium">{surfcam.name}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge 
                      variant="outline"
                      className={surfcam.id === 'viewed' ? 'text-blue-600 border-blue-300' : 'text-red-600 border-red-300'}
                    >
                      {surfcam.count.toLocaleString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{surfcam.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Plans */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-600">User Plans</CardTitle>
            <CardDescription>Distribution of successful users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowMetrics.plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="text-sm font-medium">{plan.name}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">
                      {plan.count.toLocaleString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{plan.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm">
                <strong className="text-blue-700">Top Acquisition Source:</strong>{' '}
                {flowMetrics.sources.length > 0 
                  ? `${flowMetrics.sources.reduce((max, s) => s.total > max.total ? s : max, flowMetrics.sources[0])?.name} (${flowMetrics.sources.reduce((max, s) => s.total > max.total ? s : max, flowMetrics.sources[0])?.total.toLocaleString()} users)`
                  : 'N/A'}
              </p>
              <p className="text-sm">
                <strong className="text-red-700">Biggest Account Failure:</strong>{' '}
                {flowMetrics.accounts.length > 1
                  ? flowMetrics.accounts.slice(1).reduce((max, a) => a.count > max.count ? a : max, flowMetrics.accounts[1])?.name
                  : 'N/A'}
              </p>
              <p className="text-sm">
                <strong className="text-orange-600">Surf Cam Issue:</strong>{' '}
                {flowMetrics.surfcam.length > 1
                  ? flowMetrics.surfcam.slice(1).reduce((max, s) => s.count > max.count ? s : max, flowMetrics.surfcam[1])?.name
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <strong className="text-green-700">Most Popular Plan:</strong>{' '}
                {flowMetrics.plans.length > 0
                  ? `${flowMetrics.plans.reduce((max, p) => p.count > max.count ? p : max, flowMetrics.plans[0])?.name} (${flowMetrics.plans.reduce((max, p) => p.count > max.count ? p : max, flowMetrics.plans[0])?.count.toLocaleString()} users)`
                  : 'N/A'}
              </p>
              <p className="text-sm">
                <strong className="text-cyan-600">Surf Cam Success Rate:</strong>{' '}
                {flowMetrics.surfcam.length > 0 && flowMetrics.surfcam[0]?.percentage
                  ? `${flowMetrics.surfcam[0].percentage}%`
                  : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                💡 Hover over the flowchart paths to see exact user counts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700">🎯 Actionable Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {stats.conversionRate < 70 && (
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">!</span>
                <span>
                  <strong>Account Creation Issues:</strong> Only {stats.conversionRate}% of users successfully create accounts. 
                  {flowMetrics.accounts[1]?.count > flowMetrics.accounts[2]?.count 
                    ? ' Focus on fixing email verification process.' 
                    : ' Simplify the sign-up flow to reduce steps.'}
                </span>
              </li>
            )}
            {flowMetrics.surfcam.length > 0 && flowMetrics.surfcam[0]?.percentage && parseFloat(flowMetrics.surfcam[0].percentage) < 85 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">🌊</span>
                <span>
                  <strong>Surf Cam Performance:</strong> {(100 - parseFloat(flowMetrics.surfcam[0].percentage)).toFixed(1)}% of users encounter issues viewing surf cams. 
                  {flowMetrics.surfcam[1]?.count > flowMetrics.surfcam[2]?.count 
                    ? ' Optimize video streaming and reduce lag for better performance.' 
                    : ' Consider implementing a premium ad-free experience to reduce churn.'}
                </span>
              </li>
            )}
            {flowMetrics.plans.length > 0 && flowMetrics.plans[0]?.count > flowMetrics.plans.slice(1).reduce((sum, p) => sum + p.count, 0) && (
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">⚠</span>
                <span>
                  <strong>Monetization Opportunity:</strong> {flowMetrics.plans[0]?.percentage}% are on Free Plan. 
                  Implement targeted upsell campaigns to convert free users to paid tiers.
                </span>
              </li>
            )}
            {flowMetrics.sources.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">💡</span>
                <span>
                  <strong>Channel Optimization:</strong> {flowMetrics.sources[0]?.name} is your top performer. 
                  Increase investment in this channel while testing similar audience segments.
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>A/B Testing:</strong> Test different email verification methods, sign-up flows, and surf cam streaming quality 
                to improve overall conversion rates.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlowchart;
