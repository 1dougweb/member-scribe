import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    if (!mercadoPagoAccessToken) {
      throw new Error('Mercado Pago access token not configured')
    }

    const { id, topic } = await req.json()

    if (topic === 'payment') {
      // Get payment details from MercadoPago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`
        }
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to get payment details')
      }

      const payment = await paymentResponse.json()
      
      if (payment.status === 'approved') {
        // Parse external reference to get user_id and plan_id
        const [user_id, plan_id] = payment.external_reference.split('_')

        // Create or update subscription
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id,
            plan_id,
            status: 'active',
            mercado_pago_subscription_id: payment.id.toString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          })

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError)
          throw subscriptionError
        }

        console.log(`Subscription activated for user ${user_id} with plan ${plan_id}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})