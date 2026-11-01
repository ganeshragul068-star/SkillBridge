import React from 'react';
import { Building, GraduationCap, Phone, MapPin, Mail, Edit3, User } from 'lucide-react';
import Button from '../common/Button';
import './ProfileComponents.css';

const ProfileHeader = ({ profile, user, onEdit }) => {
  const displayName = profile?.userId?.name || user?.name || 'Student';
  const displayEmail = profile?.userId?.email || user?.email || '';
  const displayCollege = profile?.college || 'College of Engineering';
  const displayDept = profile?.department || 'Computer Science & Engineering';
  const displayRole = profile?.degree ? `${profile.degree} in ${displayDept}` : displayDept;
  const displayBio = profile?.bio || 'No professional biography added yet. Click "Edit Profile" to summarize your academic focus and career aspirations.';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-header-card">
      <div className="profile-avatar-circle">
        {profile?.profileImage ? (
          <img src={profile.profileImage} alt={displayName} className="profile-avatar-img" />
        ) : (
          initials || <User size={40} />
        )}
      </div>

      <div className="profile-header-details">
        <div className="profile-header-top">
          <div>
            <h1 className="profile-header-name">{displayName}</h1>
            <span className="profile-header-role">{displayRole}</span>
          </div>
          <Button variant="navy" size="sm" icon={Edit3} onClick={onEdit}>
            Edit Profile
          </Button>
        </div>

        <p className="profile-header-bio">{displayBio}</p>

        <div className="profile-meta-pills">
          <span className="meta-pill">
            <Building size={14} /> {displayCollege}
          </span>
          {profile?.graduationYear && (
            <span className="meta-pill">
              <GraduationCap size={14} /> Class of {profile.graduationYear}
            </span>
          )}
          {profile?.phone && (
            <span className="meta-pill">
              <Phone size={14} /> {profile.phone}
            </span>
          )}
          {profile?.location && (
            <span className="meta-pill">
              <MapPin size={14} /> {profile.location}
            </span>
          )}
          {displayEmail && (
            <span className="meta-pill">
              <Mail size={14} /> {displayEmail}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
