"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile, uploadAvatar } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, User, Globe, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(user.uid, formData);
    if (result.success) {
      toast.success("Avatar updated successfully");
      setProfile({ ...profile, avatar_url: result.avatarUrl });
    } else {
      toast.error(result.error || "Failed to upload avatar");
    }
    setUploadingAvatar(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    const result = await updateProfile(user!.uid, {
      full_name: profile.full_name,
      bio: profile.bio,
      email: profile.email || user?.email,
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <p className="text-muted-foreground">Your profile is not set up yet.</p>
        <Button asChild>
          <a href="/register/role">Complete Setup</a>
        </Button>
      </div>
    );
  }

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
            <div className="flex flex-col sm:flex-row items-center gap-6">
               <div className="relative group">
                 <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                   ) : (
                     <User className="h-12 w-12 text-muted-foreground" />
                   )}
                   {uploadingAvatar && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <Loader2 className="h-6 w-6 text-white animate-spin" />
                     </div>
                   )}
                 </div>
                 <button 
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                   <Camera className="h-4 w-4" />
                 </button>
               </div>
               <div className="space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                 <Button 
                   type="button" 
                   variant="outline" 
                   size="sm" 
                   onClick={handleAvatarClick}
                   disabled={uploadingAvatar}
                 >
                   {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                 </Button>
                 <p className="text-xs text-muted-foreground">Recommended: Square image, max 2MB.</p>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileChange}
                 />
               </div>
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
              <Input id="email" value={profile?.email || user?.email || ""} disabled className="bg-muted" />
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
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                  <Globe className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">cvvault.com/p/{user?.uid}</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => {
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
