import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const requester = await serverSupabaseUser(event)

  if (requester?.user_role !== 'MANAGER') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux managers.' })
  }

  const userId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide.' })
  }

  const supabaseAdmin = serverSupabaseServiceRole<Database>(event)

  const { data: targetUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id, auth_user_id, is_active')
    .eq('id', userId)
    .single()

  if (fetchError || !targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable.' })
  }

  if (targetUser.auth_user_id === requester.sub) {
    throw createError({ statusCode: 400, statusMessage: 'Impossible de désactiver votre propre compte.' })
  }

  const nextIsActive = !targetUser.is_active

  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.auth_user_id, {
    ban_duration: nextIsActive ? 'none' : '876000h' // ~100 ans : équivalent pratique d'un bannissement indéfini
  })

  if (banError) {
    throw createError({ statusCode: 500, statusMessage: banError.message })
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ is_active: nextIsActive })
    .eq('id', userId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return { isActive: nextIsActive }
})
