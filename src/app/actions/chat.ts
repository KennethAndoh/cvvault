"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function createChat(seekerId: string, recruiterId: string, documentId?: string) {
  // Check if chat already exists
  const { data: existingChat } = await supabaseAdmin
    .from("chats")
    .select("*")
    .eq("seeker_id", seekerId)
    .eq("recruiter_id", recruiterId)
    .maybeSingle();

  if (existingChat) {
    return { success: true, chat: existingChat };
  }

  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({ seeker_id: seekerId, recruiter_id: recruiterId, document_id: documentId || null })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: error.message };
  }

  await logAction(recruiterId, "CHAT_CREATED", { chatId: data.id, seekerId, documentId });
  revalidatePath("/dashboard/chats");
  return { success: true, chat: data };
}

export async function getUserChats(userId: string) {
  const { data: chats, error: chatsError } = await supabaseAdmin
    .from("chats")
    .select("*")
    .or(`seeker_id.eq.${userId},recruiter_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (chatsError || !chats) {
    console.error("Error fetching chats:", chatsError);
    return { success: false, error: chatsError?.message };
  }

  // Get unique IDs of other users in these chats
  const otherUserIds = Array.from(
    new Set(
      chats.map((c) => (c.seeker_id === userId ? c.recruiter_id : c.seeker_id))
    )
  );

  let profilesMap: Record<string, any> = {};
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .in("id", otherUserIds);

    if (profiles) {
      profiles.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }
  }

  // Retrieve last messages and construct responses
  const chatsWithDetails = await Promise.all(
    chats.map(async (chat) => {
      const otherId = chat.seeker_id === userId ? chat.recruiter_id : chat.seeker_id;
      
      const { data: lastMessages } = await supabaseAdmin
        .from("messages")
        .select("*")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: false })
        .limit(1);

      return {
        ...chat,
        other_user: profilesMap[otherId] || { id: otherId, full_name: "Anonymous User", email: "" },
        last_message: lastMessages && lastMessages.length > 0 ? lastMessages[0] : null,
      };
    })
  );

  return { success: true, chats: chatsWithDetails };
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  // Column-agnostic insert: try inserting text column first, fallback to content column
  let data: any = null;
  let error: any = null;

  const tryText = await supabaseAdmin
    .from("messages")
    .insert({ chat_id: chatId, sender_id: senderId, text: text })
    .select()
    .maybeSingle();

  if (tryText.error && tryText.error.message.includes('column "text" of relation "messages" does not exist')) {
    const tryContent = await supabaseAdmin
      .from("messages")
      .insert({ chat_id: chatId, sender_id: senderId, content: text })
      .select()
      .maybeSingle();
    data = tryContent.data;
    error = tryContent.error;
  } else {
    data = tryText.data;
    error = tryText.error;
  }

  if (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }

  await logAction(senderId, "MESSAGE_SENT", { chatId, textLength: text.length });
  revalidatePath(`/dashboard/chats`);
  revalidatePath(`/dashboard/chats/${chatId}`);
  return { success: true, message: data };
}

// Get messages for a specific chat
export async function getMessages(chatId: string) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, error: error.message };
  }
  return { success: true, messages: data };
}

// Initialize chat and send application message
export async function initializeJobChat(seekerId: string, recruiterId: string, documentId: string, docName: string, coverLetter?: string) {
  const chatRes = await createChat(seekerId, recruiterId, documentId);
  if (!chatRes.success || !chatRes.chat) {
    return chatRes;
  }

  const chatId = chatRes.chat.id;
  const initialMsg = `Job Application Submission:\nAttached Document: "${docName}"\n\n${coverLetter ? `Cover Letter:\n"${coverLetter}"` : "No cover letter provided."}`;

  const sendRes = await sendMessage(chatId, seekerId, initialMsg);
  if (!sendRes.success) {
    return { success: false, error: "Failed to send initial message: " + sendRes.error };
  }

  return { success: true, chatId };
}

// Get total unread message count for a user (messages sent by others that are unread)
export async function getUnreadMessageCount(userId: string) {
  // Get all chats this user is part of
  const { data: chats, error: chatsError } = await supabaseAdmin
    .from("chats")
    .select("id")
    .or(`seeker_id.eq.${userId},recruiter_id.eq.${userId}`);

  if (chatsError || !chats || chats.length === 0) {
    return { success: true, count: 0 };
  }

  const chatIds = chats.map((c) => c.id);

  // Count messages NOT sent by this user that are unread
  // We use the `read_at` column if it exists, or fall back to counting all messages not from user
  const { count, error } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("chat_id", chatIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) {
    // Fallback: if read_at column doesn't exist, just return 0
    return { success: true, count: 0 };
  }

  return { success: true, count: count ?? 0 };
}
