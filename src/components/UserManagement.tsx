import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, User, Trash2, Loader2, Eye, Search, Mail, Calendar, RefreshCw, Download, Filter } from "lucide-react";
import { Phone, MapPin, MessageCircle, Globe, Pencil, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  line_id: string | null;
  preferred_contact: string | null;
}

interface UserRole {
  user_id: string;
  role: string;
}

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, roleFilter, userRoles]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfiles(profilesRes.data || []);
      setUserRoles(rolesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (profile) =>
          profile.email?.toLowerCase().includes(query) ||
          profile.full_name?.toLowerCase().includes(query) ||
          profile.id.toLowerCase().includes(query) ||
          profile.phone?.toLowerCase().includes(query) ||
          profile.line_id?.toLowerCase().includes(query) ||
          profile.city?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((profile) => {
        const role = getUserRole(profile.id);
        return role === roleFilter;
      });
    }

    setFilteredProfiles(filtered);
  };

  const getUserRole = (userId: string): string => {
    const role = userRoles.find((r) => r.user_id === userId);
    return role?.role || "user";
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete user roles first
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("User deleted successfully!");
      setDeleteUserId(null);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    }
  };

  const exportUsers = () => {
    const escape = (val: any) => {
      const s = val == null ? "" : String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csvContent = [
      ["ID", "Email", "Full Name", "Phone", "Date of Birth", "Address", "City", "Country", "LINE ID", "Preferred Contact", "Role", "Created At"].join(","),
      ...filteredProfiles.map((profile) =>
        [
          profile.id,
          profile.email || "",
          profile.full_name || "",
          profile.phone || "",
          profile.date_of_birth || "",
          profile.address || "",
          profile.city || "",
          profile.country || "",
          profile.line_id || "",
          profile.preferred_contact || "",
          getUserRole(profile.id),
          new Date(profile.created_at).toLocaleDateString(),
        ].map(escape).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Users exported successfully!");
  };

  const openProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditForm(profile);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!selectedProfile) return;
    try {
      setSavingEdit(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name || null,
          phone: editForm.phone || null,
          date_of_birth: editForm.date_of_birth || null,
          address: editForm.address || null,
          city: editForm.city || null,
          country: editForm.country || null,
          line_id: editForm.line_id || null,
          preferred_contact: editForm.preferred_contact || null,
        })
        .eq("id", selectedProfile.id);
      if (error) throw error;
      toast.success("User updated successfully");
      setIsEditing(false);
      await fetchData();
      // refresh open dialog with new data
      setSelectedProfile({ ...selectedProfile, ...editForm } as Profile);
    } catch (e: any) {
      toast.error("Failed to update user: " + e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const stats = {
    total: profiles.length,
    admins: userRoles.filter((r) => r.role === "admin").length,
    users: profiles.length - userRoles.filter((r) => r.role === "admin").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-accent/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.admins}</p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </div>
          <div className="bg-primary/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.users}</p>
            <p className="text-sm text-muted-foreground">Regular Users</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredProfiles.length} of {profiles.length} users
        </p>

        {viewMode === "cards" ? (
          <div className="space-y-4">
            {filteredProfiles.map((profile) => {
              const role = getUserRole(profile.id);
              const isAdmin = role === "admin";

              return (
                <Card
                  key={profile.id}
                  className="p-4 hover:shadow-md transition-all duration-300 animate-fade-in"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-gold">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {profile.full_name || "No name set"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile.email}
                        </p>
                        {profile.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {profile.phone}
                          </p>
                        )}
                        {(profile.city || profile.country) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[profile.city, profile.country].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={isAdmin ? "default" : "secondary"}
                        className={isAdmin ? "bg-accent text-accent-foreground" : ""}
                      >
                        {isAdmin ? (
                          <>
                            <Shield className="mr-1 h-3 w-3" /> Admin
                          </>
                        ) : (
                          <>
                            <User className="mr-1 h-3 w-3" /> User
                          </>
                        )}
                      </Badge>

                       <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProfile(profile)}
                        className="hover-scale"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteUserId(profile.id)}
                        className="hover-scale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => {
                  const role = getUserRole(profile.id);
                  const isAdmin = role === "admin";

                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-gold text-xs">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{profile.full_name || "No name"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                      <TableCell className="text-muted-foreground">{profile.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isAdmin ? "default" : "secondary"} className={isAdmin ? "bg-accent" : ""}>
                          {isAdmin ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openProfile(profile)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteUserId(profile.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </CardContent>

      {/* User Details Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(o) => { if (!o) { setSelectedProfile(null); setIsEditing(false); } }}>
        <DialogContent className="animate-scale-in max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>User Details</span>
              {!isEditing ? (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditForm(selectedProfile || {}); }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveEdit} disabled={savingEdit}>
                    {savingEdit ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>Customer profile information</DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProfile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-gold">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedProfile.full_name || "No name set"}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                  <Badge
                    variant={getUserRole(selectedProfile.id) === "admin" ? "default" : "secondary"}
                    className={`mt-1 ${getUserRole(selectedProfile.id) === "admin" ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    {getUserRole(selectedProfile.id) === "admin" ? (
                      <><Shield className="mr-1 h-3 w-3" /> Admin</>
                    ) : (
                      <><User className="mr-1 h-3 w-3" /> User</>
                    )}
                  </Badge>
                </div>
              </div>

              {/* Fields */}
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailItem icon={<User className="h-4 w-4" />} label="Full Name" value={selectedProfile.full_name} />
                  <DetailItem icon={<Phone className="h-4 w-4" />} label="Phone" value={selectedProfile.phone} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={selectedProfile.date_of_birth} />
                  <DetailItem icon={<MessageCircle className="h-4 w-4" />} label="LINE ID" value={selectedProfile.line_id} />
                  <DetailItem icon={<MapPin className="h-4 w-4" />} label="Address" value={selectedProfile.address} className="sm:col-span-2" />
                  <DetailItem icon={<MapPin className="h-4 w-4" />} label="City" value={selectedProfile.city} />
                  <DetailItem icon={<Globe className="h-4 w-4" />} label="Country" value={selectedProfile.country} />
                  <DetailItem icon={<Mail className="h-4 w-4" />} label="Preferred Contact" value={selectedProfile.preferred_contact} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label="Member Since" value={new Date(selectedProfile.created_at).toLocaleDateString()} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditField label="Full Name" value={editForm.full_name || ""} onChange={(v) => setEditForm({ ...editForm, full_name: v })} />
                  <EditField label="Phone" value={editForm.phone || ""} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
                  <EditField label="Date of Birth" type="date" value={editForm.date_of_birth || ""} onChange={(v) => setEditForm({ ...editForm, date_of_birth: v })} />
                  <EditField label="LINE ID" value={editForm.line_id || ""} onChange={(v) => setEditForm({ ...editForm, line_id: v })} />
                  <div className="sm:col-span-2">
                    <EditField label="Address" value={editForm.address || ""} onChange={(v) => setEditForm({ ...editForm, address: v })} />
                  </div>
                  <EditField label="City" value={editForm.city || ""} onChange={(v) => setEditForm({ ...editForm, city: v })} />
                  <EditField label="Country" value={editForm.country || ""} onChange={(v) => setEditForm({ ...editForm, country: v })} />
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Preferred Contact</Label>
                    <Select
                      value={editForm.preferred_contact || ""}
                      onValueChange={(v) => setEditForm({ ...editForm, preferred_contact: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Choose method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">LINE</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-xs break-all">{selectedProfile.id}</p>
              </div>

              {!isEditing && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    setDeleteUserId(selectedProfile.id);
                    setSelectedProfile(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete User
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUser(deleteUserId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  className?: string;
}) => (
  <div className={`flex items-start gap-3 p-3 bg-secondary/30 rounded-lg ${className}`}>
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value || "—"}</p>
    </div>
  </div>
);

const EditField = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);
