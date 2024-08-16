import { toast } from 'sonner'
import { supabase } from './supabaseClient'

export interface Attachment {
  name: string
  contentType: string
  url: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  experimental_attachments?: (Attachment | File)[]
}

export async function saveChatHistory(sessionId: string, messages: ChatMessage[], totalTokens: number) {
  if (messages.length === 0) return

  try {
    const title = messages[0].content.substring(0, 50) + '...'

    // Upsert the chat session with total token usage
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .upsert({ id: sessionId, title, usage: totalTokens }, { onConflict: 'id' })

    if (sessionError) {
      throw new Error(`Error saving chat session: ${sessionError.message}`)
    }

    // Fetch existing messages for this session
    const { data: existingMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id, content')
      .eq('session_id', sessionId)

    if (fetchError) {
      throw new Error(`Error fetching existing messages: ${fetchError.message}`)
    }

    // Delete messages that are no longer in the updated list
    const messagesToDelete = existingMessages?.filter(
      existingMsg => !messages.some(msg => msg.content === existingMsg.content)
    )

    if (messagesToDelete && messagesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .in(
          'id',
          messagesToDelete.map(msg => msg.id)
        )

      if (deleteError) {
        throw new Error(`Error deleting messages: ${deleteError.message}`)
      }
    }

    // Update or insert messages
    for (const msg of messages) {
      const existingMessage = existingMessages?.find(existingMsg => existingMsg.content === msg.content)

      if (existingMessage) {
        // Only update content if it has changed
        if (existingMessage.content !== msg.content) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ content: msg.content })
            .eq('id', existingMessage.id)

          if (updateError) {
            throw new Error(`Error updating message: ${updateError.message}`)
          }
        }
      } else {
        // Insert new message (this part remains unchanged)
        const { data: insertedMessage, error: insertError } = await supabase
          .from('messages')
          .insert({
            session_id: sessionId,
            role: msg.role,
            content: msg.content
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(`Error inserting message: ${insertError.message}`)
        }

        // Handle attachments
        if (msg.experimental_attachments && msg.experimental_attachments.length > 0) {
          for (const attachment of msg.experimental_attachments) {
            let file: File
            if (attachment instanceof File) {
              file = attachment
            } else {
              // For data URLs, we need to convert them to a File or Blob before uploading
              const response = await fetch(attachment.url)
              const blob = await response.blob()
              file = new File([blob], attachment.name, { type: attachment.contentType })
            }

            const filePath = `${sessionId}/${insertedMessage.id}/${file.name}`

            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('attachments')
              .upload(filePath, file)

            if (uploadError) {
              throw new Error(`Error uploading file: ${uploadError.message}`)
            }

            // Get public URL for the uploaded file
            const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(filePath)

            // Save attachment metadata to the database
            const { data: attachmentData, error: attachmentError } = await supabase.from('attachments').insert({
              message_id: insertedMessage.id,
              name: file.name,
              contentType: file.type,
              url: urlData.publicUrl
            })

            if (attachmentError) {
              throw new Error(`Error saving attachment metadata: ${attachmentError.message}`)
            }
          }
        } else {
        }
      }
    }
  } catch (error) {
    toast.error('Error in saveChatHistory:', error || 'Unknown error')
    throw error
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', messageId)

    if (error) {
      throw new Error(`Error deleting message: ${error.message}`)
    }
  } catch (error) {
    toast.error('Error deleting message:', error || 'Unknown error')
    throw error
  }
}

export async function deleteChatSession(sessionId: string) {
  try {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId)
    if (error) {
      throw new Error(`Error deleting chat session: ${error.message}`)
    }
  } catch (error) {
    toast.error('Error deleting chat session:', error || 'Unknown error')
    throw error
  }
}

export async function fetchChatHistory(sessionId: string) {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return []
    }

    const { data: attachments, error: attachmentsError } = await supabase
      .from('attachments')
      .select('*')
      .in(
        'message_id',
        messages.map(m => m.id)
      )

    if (attachmentsError) {
      return messages
    }

    const messagesWithAttachments = messages.map(message => ({
      ...message,
      experimental_attachments: attachments.filter(a => a.message_id === message.id)
    }))

    return messagesWithAttachments
  } catch (error) {
    return []
  }
}

export async function fetchChatSessions() {
  const { data, error } = await supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false })

  if (error) {
    toast.error(`Error fetching chat sessions: ${error.message}`)
    return []
  }

  return data
}

export async function fetchSettings() {
  try {
    const { data, error } = await supabase.from('settings').select('key, value')

    if (error) {
      throw error
    }

    const settings = data.reduce(
      (acc, { key, value }) => {
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )

    return settings
  } catch (error) {
    toast.error('Error fetching settings:', error || 'Unknown error')
    return {}
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    // First, check if the value has actually changed
    const { data: currentSetting, error: fetchError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // If the value hasn't changed, don't update or show a toast
    if (currentSetting && currentSetting.value === value) {
      return
    }

    // Proceed with the update if the value has changed
    const { error: updateError } = await supabase.from('settings').update({ value }).eq('key', key)

    if (updateError) {
      throw updateError
    }

    toast.success(`Setting "${key}" updated successfully`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    toast.error(`Error updating setting "${key}": ${errorMessage}`)
  }
}
