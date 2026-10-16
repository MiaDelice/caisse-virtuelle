import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

interface CreateUserBody {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'SELLER' | 'MANAGER'
}

export default defineEventHandler(async (event) => {
  const requester = await serverSupabaseUser(event)

  if (requester?.user_role !== 'MANAGER') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux managers.' })
  }

  const body = await readBody<CreateUserBody>(event)

  if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
    throw createError({ statusCode: 400, statusMessage: 'Champs manquants.' })
  }

  const supabaseAdmin = serverSupabaseServiceRole<Database>(event)

  const { data: createdAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true
  })

  if (authError || !createdAuthUser.user) {
    throw createError({ statusCode: 400, statusMessage: authError?.message ?? 'Création du compte impossible.' })
  }

  const { error: insertError } = await supabaseAdmin.from('users').insert({
    auth_user_id: createdAuthUser.user.id,
    first_name: body.firstName,
    last_name: body.lastName,
    role: body.role
  })

  if (insertError) {
    // Rollback : évite un compte Auth orphelin sans ligne public.users associée.
    await supabaseAdmin.auth.admin.deleteUser(createdAuthUser.user.id)
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  return { success: true }
})
