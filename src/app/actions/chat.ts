"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function createChat(seekerId: string, recruiterId: string, documentId?: string) {
  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({ seeker_id: seekerId, recruiter_id: recruiterId, document_id: documentId })
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
  const { data, error } = await supabaseAdmin
    .from("chats")
    .select("*, messages!inner(*)")
    .or(`seeker_id.eq.${userId},recruiter_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: error.message };
  }
  return { success: true, chats: data };
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({ chat_id: chatId, sender_id: senderId, text })
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
  await logAction(senderId, "MESSAGE_SENT", { chatId, textLength: text.length });
  revalidatePath(`/dashboard/chats/${chatId}`);
  return { success: true, message: data };
}
// Get messages for a specific chat
export async function getMessages(chatId: string) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("id, sender_id, receiver_id, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, error: error.message };
  }
  return { success: true, messages: data };
}
