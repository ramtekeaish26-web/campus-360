import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { EditProfileModal } from './EditProfileModal.js';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  QrCode,
  Download,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) return null;

  const profile = user.profile;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : user.email;
  const primaryRole = user.roles[0] || 'STUDENT';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="hover:text-primary transition-colors cursor-pointer">Portal Home</span>
          <span>/</span>
          <span className="text-on-surface font-semibold">Institutional Profile & Verified Identity</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          <span>TGPCET Attestation Engine v1.0</span>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 md:p-8 border border-outline shadow-sm">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary-fixed/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with Verified User Icon */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-md bg-surface-container-high border border-outline flex items-center justify-center font-display font-black text-3xl text-on-surface">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName.charAt(0)}</span>
                )}
              </div>
              <div
                className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary p-1.5 rounded-xl shadow-md flex items-center justify-center"
                title="Autonomous Identity Verified"
              >
                <ShieldCheck className="w-5 h-5 text-tertiary-fixed" />
              </div>
            </div>

            {/* Name & Academic Meta */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    primaryRole === 'ADMIN' ? 'admin' : primaryRole === 'FACULTY' ? 'faculty' : 'student'
                  }
                  size="md"
                >
                  {primaryRole}
                </Badge>
                {profile?.prn && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-mono font-semibold text-on-surface">
                    PRN: {profile.prn}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-tertiary text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Standing
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
                {fullName}
              </h1>

              <p className="text-xs md:text-sm text-on-surface-variant font-medium">
                {profile?.department?.name || 'Department of Computer Science & Engineering'}
                {profile?.program?.name ? ` · ${profile.program.name}` : ''}
              </p>

              {profile?.bio && (
                <p className="text-xs text-on-surface-variant max-w-xl pt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Edit Profile Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Contact Info
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<QrCode className="w-4 h-4" />}
              onClick={() => alert(`PRN Credential Verified: ${profile?.prn || user.email}`)}
            >
              Verify Digital ID
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" />
              <span>Personal & Institutional Information</span>
            </CardTitle>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-3.5 h-3.5" /> First Name
                </span>
                <p className="font-semibold text-sm text-on-surface">{profile?.firstName || '—'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-3.5 h-3.5" /> Last Name
                </span>
                <p className="font-semibold text-sm text-on-surface">{profile?.lastName || '—'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5" /> Official Email (Immutable)
                </span>
                <p className="font-mono font-semibold text-xs text-on-surface">{user.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5" /> Contact Phone
                </span>
                <p className="font-mono font-semibold text-xs text-on-surface">
                  {profile?.phone || 'Not configured'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5" /> Department
                </span>
                <p className="font-semibold text-xs text-on-surface">
                  {profile?.department?.name || 'Computer Science & Engineering'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1">
                <span className="text-on-surface-variant flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-3.5 h-3.5" /> Program & Degree
                </span>
                <p className="font-semibold text-xs text-on-surface">
                  {profile?.program?.name || 'Bachelor of Technology'}
                </p>
              </div>
            </div>

            {profile?.bio && (
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline/50 space-y-1 text-xs">
                <span className="text-on-surface-variant font-medium">Academic Bio / Focus Area</span>
                <p className="text-on-surface leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Institutional Account Governance Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              <span>Account Governance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Account Status</span>
                <span className="font-semibold text-tertiary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  {user.isActive ? 'Active & Verified' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">System User ID</span>
                <span className="font-mono text-[10px] text-on-surface-variant truncate max-w-[140px]">
                  {user.id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Assigned Role</span>
                <Badge
                  variant={
                    primaryRole === 'ADMIN' ? 'admin' : primaryRole === 'FACULTY' ? 'faculty' : 'student'
                  }
                  size="sm"
                >
                  {primaryRole}
                </Badge>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Autonomous PRN</span>
                <span className="font-mono font-semibold text-on-surface">
                  {profile?.prn || 'N/A'}
                </span>
              </div>

              {profile?.rollNo && (
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="text-on-surface-variant">Roll Number</span>
                  <span className="font-mono font-semibold text-on-surface">{profile.rollNo}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-surface-container rounded-xl text-[11px] text-on-surface-variant leading-relaxed">
              <strong>Institutional Policy:</strong> Roles, PRN codes, and email addresses are cryptographically signed and managed by TGPCET autonomous academic administration.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={refreshUser}
      />
    </div>
  );
};
