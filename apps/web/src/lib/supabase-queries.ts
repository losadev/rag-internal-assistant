import { supabase } from "./supabase";

// ===== CONVERSATIONS =====

export async function createConversation(title: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([{ title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConversationById(id: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateConversation(id: string, title: string) {
  const { data, error } = await supabase
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConversation(id: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", id);

  if (error) throw error;
}

// ===== MESSAGES =====

export async function createMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  sources?: any
) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, role, content, sources }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("messages").delete().eq("id", id);

  if (error) throw error;
}
