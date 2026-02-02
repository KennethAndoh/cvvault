"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, User, Globe, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getProfile(user!.uid);
    if (result.success) {
      setProfile(result.profile);
      if (!result.profile) {
        toast.info("Profile not found. Creating a default profile for you...");
      }
    } else {
      toast.error("Failed to fetch profile");
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    const result = await updateProfile(user!.uid, {
      full_name: profile.full_name,
      bio: profile.bio,
      public_profile_enabled: profile.public_profile_enabled,
    });

    if (result.success) {
      toast.success("Profile updated successfully");
      setProfile(result.profile);
    } else {
      toast.error("Update failed");
    }
    setUpdating(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and profile visibility.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details shown on your profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
               <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary/20">
                 <User className="h-12 w-12 text-muted-foreground" />
               </div>
               <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                value={profile?.full_name || ""} 
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed here.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell recruiters about yourself..." 
                className="min-h-[100px]"
                value={profile?.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>Allow others to view your professional profile via a public link.</CardDescription>
              </div>
              <Switch 
                checked={profile?.public_profile_enabled || false}
                onCheckedChange={(checked) => setProfile({ ...profile, public_profile_enabled: checked })}
              />
            </div>
          </CardHeader>
          <CardContent>
            {profile?.public_profile_enabled && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">cvvault.com/p/{user?.uid}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/p/${user?.uid}`);
                  toast.success("Link copied!");
                }}>
                  Copy Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updating}>
            {updating ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
