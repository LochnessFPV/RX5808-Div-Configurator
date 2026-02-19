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
        
        // Store event
        await env.ANALYTICS.put(eventKey, JSON.stringify({
          ...data,
          timestamp,
          ip: request.headers.get('CF-Connecting-IP'),
          country: request.cf?.country || 'Unknown',
          userAgent: request.headers.get('User-Agent'),
        }), {
          expirationTtl: 31536000, // 1 year
        });

        // Update counters
        const counterKey = `counter:${data.event}:${data.version || 'all'}`;
        const currentCount = parseInt(await env.ANALYTICS.get(counterKey) || '0');
        await env.ANALYTICS.put(counterKey, (currentCount + 1).toString());

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

    // Get stats endpoint (for dashboard)
    if (url.pathname === '/stats' && request.method === 'GET') {
      try {
        const stats = {
          pageViews: 0,
          versionSelections: {},
          installClicks: {},
          installSuccess: {},
          installFailed: {},
        };

        // List all counter keys
        const list = await env.ANALYTICS.list({ prefix: 'counter:' });
        
        for (const key of list.keys) {
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
