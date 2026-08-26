import { type APIRoute } from 'astro';
import { services } from '../../config/services';
import { checkAllServices } from '../../lib/monitor';

export const GET: APIRoute = async () => {
  try {
    const serviceStatuses = await checkAllServices(services);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      services: serviceStatuses,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};