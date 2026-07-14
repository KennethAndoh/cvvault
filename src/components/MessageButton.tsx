// src/components/MessageButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { createChat } from "@/app/actions/chat";
import { useAuth } from "@/contexts/AuthContext";

interface MessageButtonProps {
  seekerId: string;
  documentId: string;
}

export default function MessageButton({ seekerId, documentId }: MessageButtonProps) {
  const { user } = useAuth();
  if (!user || user.uid === seekerId) return null;
  return (
    <form action={createChat} className="inline-block ml-2">
      <input type="hidden" name="seekerId" value={seekerId} />
      <input type="hidden" name="recruiterId" value={user.uid} />
      <input type="hidden" name="documentId" value={documentId} />
      <Button size="sm" variant="default">
        Message Recruiter
      </Button>
    </form>
  );
}
