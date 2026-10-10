import React, { useState } from 'react';
import { User } from '../../types/index.js';
import { userService, UpdateProfilePayload } from '../../services/userService.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const profile = user.profile;

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateProfilePayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      };

      await userService.updateMe(payload);
      setSuccess(true);
      onProfileUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Institutional Profile"
      description="Update permitted contact & biographical details. Academic records, PRN and roles are strictly managed by administrative registrar."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-2 text-xs text-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center gap-2 text-xs text-tertiary">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
            required
          />
          <Input
            label="Last Name *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
            required
          />
        </div>

        <Input
          label="Contact Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 XXXXX XXXXX"
          helperText="Used for autonomous alert notifications"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-on-surface">Bio / Academic Specialization</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full p-3 bg-surface-container-lowest text-on-surface font-sans text-sm rounded-lg border border-outline placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-container"
            placeholder="Add brief academic bio or focus area..."
            maxLength={500}
          />
          <p className="text-[11px] text-on-surface-variant text-right">{bio.length} / 500 characters</p>
        </div>

        <Input
          label="Avatar URL (Optional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          helperText="Direct image link for profile portrait"
        />

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline/40 text-xs space-y-1 text-on-surface-variant">
          <p className="font-semibold text-on-surface">Immutable System Fields</p>
          <p className="font-mono text-[11px]">
            Email: <span className="text-on-surface">{user.email}</span> · PRN: <span className="text-on-surface">{profile?.prn || 'N/A'}</span> · Role: <span className="text-on-surface">{user.roles.join(', ')}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
