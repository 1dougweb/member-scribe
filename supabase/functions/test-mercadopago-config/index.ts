import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== TESTING MERCADO PAGO CONFIGURATION ===');
    
    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    
    if (!mercadoPagoAccessToken) {
      return new Response(
        JSON.stringify({ 
          configured: false, 
          error: 'MERCADO_PAGO_ACCESS_TOKEN not configured in environment variables' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Test the token by making a simple API call to MercadoPago
    const testResponse = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`
      }
    })

    if (testResponse.ok) {
      const userData = await testResponse.json()
      return new Response(
        JSON.stringify({ 
          configured: true, 
          user_id: userData.id,
          email: userData.email 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      const errorData = await testResponse.text()
      return new Response(
        JSON.stringify({ 
          configured: false, 
          error: `Invalid access token: ${errorData}` 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }
  } catch (error) {
    console.error('Test error:', error)
    return new Response(
      JSON.stringify({ 
        configured: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})