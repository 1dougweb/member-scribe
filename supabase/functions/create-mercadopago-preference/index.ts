import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { plan_id, plan_name, price } = await req.json()

    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    if (!mercadoPagoAccessToken) {
      throw new Error('Mercado Pago access token not configured')
    }

    // Create preference for Mercado Pago
    const preference = {
      items: [
        {
          title: `Assinatura ${plan_name}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(price)
        }
      ],
      payer: {
        email: user.email
      },
      back_urls: {
        success: `${req.headers.get('origin')}/dashboard/member/subscription?status=success`,
        failure: `${req.headers.get('origin')}/dashboard/member/subscription?status=failure`,
        pending: `${req.headers.get('origin')}/dashboard/member/subscription?status=pending`
      },
      auto_return: 'approved',
      external_reference: `${user.id}_${plan_id}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mercadoPagoAccessToken}`
      },
      body: JSON.stringify(preference)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('MercadoPago API error:', errorData)
      throw new Error('Failed to create payment preference')
    }

    const preferenceData = await response.json()

    return new Response(
      JSON.stringify({ 
        preference_id: preferenceData.id,
        init_point: preferenceData.init_point
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})