import React from 'react';
import { FolderGit2, ExternalLink, Code2, Calendar, Edit3, Trash2 } from 'lucide-react';
import './ProfileComponents.css';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const techList = project.technologies && project.technologies.length > 0
    ? project.technologies
    : (project.techStack && project.techStack.length > 0 ? project.techStack : []);

  const projectUrl = project.projectUrl || project.liveUrl;

  return (
    <div className="item-card-row">
      <div className="item-card-content">
        <h4 className="item-title">{project.title}</h4>
        {project.description && <p className="item-desc">{project.description}</p>}

        {techList.length > 0 && (
          <div className="tech-tags-group">
            {techList.map((tech, idx) => (
              <span key={idx} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.825rem' }}>
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--blue-600)', fontWeight: 600 }}
            >
              <ExternalLink size={13} /> Live Application
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--navy-900)', fontWeight: 600 }}
            >
              <Code2 size={13} /> Source Code
            </a>
          )}
          {project.completionDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--slate-500)' }}>
              <Calendar size={13} /> Completed: {new Date(project.completionDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button className="icon-btn-edit" onClick={() => onEdit(project)} title="Edit Project">
          <Edit3 size={15} />
        </button>
        <button className="icon-btn-delete" onClick={() => onDelete(project._id)} title="Delete Project">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
