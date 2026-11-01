import React from 'react';
import { Award, ExternalLink, Calendar, Hash, Edit3, Trash2 } from 'lucide-react';
import './ProfileComponents.css';

const CertificationCard = ({ cert, onEdit, onDelete }) => {
  const certName = cert.name || cert.title;
  const certIssuer = cert.issuingOrganization || cert.issuer;

  return (
    <div className="item-card-row">
      <div className="item-card-content">
        <h4 className="item-title">{certName}</h4>
        <div className="item-subtitle">{certIssuer}</div>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.4rem' }}>
          {cert.issueDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> Issued: {new Date(cert.issueDate).toLocaleDateString()}
            </span>
          )}
          {cert.credentialId && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Hash size={13} /> ID: {cert.credentialId}
            </span>
          )}
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--blue-600)', fontWeight: 600 }}
            >
              <ExternalLink size={13} /> Verify Credential
            </a>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button className="icon-btn-edit" onClick={() => onEdit(cert)} title="Edit Certification">
          <Edit3 size={15} />
        </button>
        <button className="icon-btn-delete" onClick={() => onDelete(cert._id)} title="Delete Certification">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default CertificationCard;
