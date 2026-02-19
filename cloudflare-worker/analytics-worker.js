// Cloudflare Worker for RX5808-Div Analytics
// Deploy this to Cloudflare Workers and bind a KV namespace called "ANALYTICS"

export default {
  async fetch(request, env) {
    // CORS headers for GitHub Pages
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://lochnessfpv.github.io',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Track event endpoint
    if (url.pathname === '/track' && request.method === 'POST') {
      try {
        const data = await request.json();
        const timestamp = new Date().toISOString();
        const eventKey = `event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        
        const eventData = {
          ...data,
          timestamp,
          ip: request.headers.get('CF-Connecting-IP'),
          country: request.cf?.country || 'Unknown',
          userAgent: request.headers.get('User-Agent'),
          // Extract browser and device info
          browser: getBrowser(request.headers.get('User-Agent')),
          device: getDevice(request.headers.get('User-Agent')),
          // Parse time data
          hour: new Date(timestamp).getUTCHours(),
          dayOfWeek: new Date(timestamp).getUTCDay(),
          month: timestamp.substring(0, 7), // YYYY-MM
        };
        
        // Store event
        await env.ANALYTICS.put(eventKey, JSON.stringify(eventData), {
          expirationTtl: 31536000, // 1 year
        });

        // Update counters
        const counterKey = `counter:${data.event}:${data.version || 'all'}`;
        const currentCount = parseInt(await env.ANALYTICS.get(counterKey) || '0');
        await env.ANALYTICS.put(counterKey, (currentCount + 1).toString());

        // Track unique visitors (simple approach using visitor_id from client)
        if (data.event === 'page_view' && data.visitor_id) {
          const visitorKey = `visitor:${data.visitor_id}`;
          const existing = await env.ANALYTICS.get(visitorKey);
          if (!existing) {
            await env.ANALYTICS.put(visitorKey, timestamp, {
              expirationTtl: 2592000, // 30 days
            });
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Helper functions
    function getBrowser(userAgent) {
      if (!userAgent) return 'Unknown';
      if (userAgent.includes('Edg/')) return 'Edge';
      if (userAgent.includes('Chrome/')) return 'Chrome';
      if (userAgent.includes('Firefox/')) return 'Firefox';
      if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) return 'Safari';
      if (userAgent.includes('Opera') || userAgent.includes('OPR/')) return 'Opera';
      return 'Other';
    }

    function getDevice(userAgent) {
      if (!userAgent) return 'Unknown';
      if (/mobile/i.test(userAgent)) return 'Mobile';
      if (/tablet|ipad/i.test(userAgent)) return 'Tablet';
      return 'Desktop';
    }

    // Get stats endpoint (for dashboard)
    if (url.pathname === '/stats' && request.method === 'GET') {
      try {
        const stats = {
          pageViews: 0,
          versionSelections: {},
          installClicks: {},
          installSuccess: {},
          installFailed: {},
          dailyStats: {},
          countries: {},
          browsers: {},
          devices: {},
          hourlyStats: {},
          weekdayStats: {},
          monthlyStats: {},
          referrers: {},
          timeOnPage: [],
          uniqueVisitors: 0,
          conversionRate: 0,
          geographicReach: 0,
        };

        // List all keys
        const counterList = await env.ANALYTICS.list({ prefix: 'counter:' });
        const eventList = await env.ANALYTICS.list({ prefix: 'event:' });
        const visitorList = await env.ANALYTICS.list({ prefix: 'visitor:' });
        
        // Count unique visitors
        stats.uniqueVisitors = visitorList.keys.length;
        
        // Process counter keys
        for (const key of counterList.keys) {
          const value = parseInt(await env.ANALYTICS.get(key.name) || '0');
          const parts = key.name.split(':');
          const eventType = parts[1];
          const version = parts[2];

          if (eventType === 'page_view') {
            stats.pageViews += value;
          } else if (eventType === 'version_selected') {
            stats.versionSelections[version] = value;
          } else if (eventType === 'install_click') {
            stats.installClicks[version] = value;
          } else if (eventType === 'install_success') {
            stats.installSuccess[version] = value;
          } else if (eventType === 'install_failed') {
            stats.installFailed[version] = value;
          }
        }

        // Process event keys for detailed analytics
        for (const key of eventList.keys) {
          try {
            const eventData = JSON.parse(await env.ANALYTICS.get(key.name));
            const date = eventData.timestamp.split('T')[0]; // YYYY-MM-DD
            const country = eventData.country || 'Unknown';
            const browser = eventData.browser || 'Unknown';
            const device = eventData.device || 'Unknown';
            const hour = eventData.hour || 0;
            const dayOfWeek = eventData.dayOfWeek || 0;
            const month = eventData.month || date.substring(0, 7);
            const referrer = eventData.referrer || 'Direct';

            // Track daily page views
            if (eventData.event === 'page_view') {
              stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
              stats.monthlyStats[month] = (stats.monthlyStats[month] || 0) + 1;
              stats.referrers[referrer] = (stats.referrers[referrer] || 0) + 1;
            }

            // Track hourly distribution
            stats.hourlyStats[hour] = (stats.hourlyStats[hour] || 0) + 1;
            
            // Track weekday distribution
            stats.weekdayStats[dayOfWeek] = (stats.weekdayStats[dayOfWeek] || 0) + 1;

            // Track countries
            stats.countries[country] = (stats.countries[country] || 0) + 1;
            
            // Track browsers and devices
            stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
            stats.devices[device] = (stats.devices[device] || 0) + 1;
            
            // Track time on page
            if (eventData.timeOnPage) {
              stats.timeOnPage.push(eventData.timeOnPage);
            }
          } catch (e) {
            // Skip malformed events
            continue;
          }
        }

        // Calculate derived metrics
        const totalInstalls = Object.values(stats.installClicks).reduce((a, b) => a + b, 0);
        stats.conversionRate = stats.pageViews > 0 ? 
          ((totalInstalls / stats.pageViews) * 100).toFixed(1) : 0;
        
        stats.geographicReach = Object.keys(stats.countries).length;
        
        // Calculate average time on page
        if (stats.timeOnPage.length > 0) {
          const avgTime = stats.timeOnPage.reduce((a, b) => a + b, 0) / stats.timeOnPage.length;
          stats.avgTimeOnPage = Math.round(avgTime);
        } else {
          stats.avgTimeOnPage = 0;
        }

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('RX5808-Div Analytics API', {
      headers: corsHeaders,
    });
  },
};
