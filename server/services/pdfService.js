const PDFDocument = require('pdfkit');

/**
 * Generate PDF Buffer for a resume document
 * @param {Object} resume - Resume document object
 * @returns {Promise<Buffer>}
 */
async function generatePdfBuffer(resume) {
  return new Promise((resolve, reject) => {
    try {
      const template = (resume.template || 'ats').toLowerCase();
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 40, right: 40 },
        bufferPages: true,
        info: {
          Title: resume.title || 'Student Resume',
          Author: resume.personalInfo?.fullName || 'SkillBridge Candidate',
          Subject: resume.targetRole || 'Technical Resume',
          Creator: 'SkillBridge Platform',
          Producer: 'SkillBridge PDF Engine'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      if (template === 'classic') {
        renderClassicTemplate(doc, resume);
      } else if (template === 'modern') {
        renderModernTemplate(doc, resume);
      } else {
        renderAtsTemplate(doc, resume);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * ============================================================================
 * ATS-FRIENDLY TEMPLATE (Harvard / Standard Technical ATS Format)
 * Clean, single column, standard Helvetica font, high parseability
 * ============================================================================
 */
function renderAtsTemplate(doc, resume) {
  const p = resume.personalInfo || {};

  // Header: Centered Full Name
  doc.font('Helvetica-Bold')
    .fontSize(18)
    .fillColor('#111827')
    .text((p.fullName || 'Candidate Name').toUpperCase(), { align: 'center' });

  // Contact Info Line
  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.linkedinUrl ? cleanUrl(p.linkedinUrl) : null,
    p.githubUrl ? cleanUrl(p.githubUrl) : null,
    p.portfolioUrl ? cleanUrl(p.portfolioUrl) : null
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.moveDown(0.3);
    doc.font('Helvetica')
      .fontSize(9)
      .fillColor('#374151')
      .text(contactParts.join('  |  '), { align: 'center' });
  }

  // Summary
  if (p.summary && p.summary.trim()) {
    renderAtsSectionHeader(doc, 'PROFESSIONAL SUMMARY');
    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#1F2937')
      .text(p.summary.trim(), { lineGap: 2 });
  }

  // Education
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    renderAtsSectionHeader(doc, 'EDUCATION');
    resume.education.forEach((edu, idx) => {
      if (idx > 0) doc.moveDown(0.4);

      const years = [edu.startYear, edu.endYear].filter(Boolean).join(' - ');
      renderTwoColumnRow(
        doc,
        edu.institution || 'University',
        years,
        'Helvetica-Bold',
        'Helvetica-Bold',
        10
      );

      const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
      const subLine = [degreeLine, edu.grade ? `CGPA/Grade: ${edu.grade}` : null].filter(Boolean).join(' | ');

      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#374151')
        .text(subLine);
    });
  }

  // Technical Skills
  if (Array.isArray(resume.skills) && resume.skills.length > 0) {
    renderAtsSectionHeader(doc, 'TECHNICAL SKILLS');

    // Group skills by category
    const grouped = {};
    resume.skills.forEach(skill => {
      const cat = skill.category || 'Core Skills';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill.name);
    });

    Object.entries(grouped).forEach(([category, skillList]) => {
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#111827')
        .text(`${category}: `, { continued: true })
        .font('Helvetica')
        .fillColor('#374151')
        .text(skillList.join(', '));
    });
  }

  // Experience
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    renderAtsSectionHeader(doc, 'EXPERIENCE');
    resume.experience.forEach((exp, idx) => {
      if (idx > 0) doc.moveDown(0.5);

      const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
      renderTwoColumnRow(
        doc,
        exp.role || 'Position',
        dates,
        'Helvetica-Bold',
        'Helvetica',
        10
      );

      const companyLine = [exp.company, exp.location].filter(Boolean).join(' • ');
      doc.font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#4B5563')
        .text(companyLine);

      if (exp.description) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#374151')
          .text(exp.description, { lineGap: 1.5 });
      }

      if (Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0) {
        renderBulletPoints(doc, exp.bulletPoints, 9);
      }
    });
  }

  // Projects
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    renderAtsSectionHeader(doc, 'PROJECTS');
    resume.projects.forEach((proj, idx) => {
      if (idx > 0) doc.moveDown(0.5);

      const dates = [proj.startDate, proj.endDate].filter(Boolean).join(' - ');
      renderTwoColumnRow(
        doc,
        proj.title || 'Project',
        dates,
        'Helvetica-Bold',
        'Helvetica',
        10
      );

      const metaParts = [];
      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        metaParts.push(`Tech Stack: ${proj.technologies.join(', ')}`);
      }
      if (proj.liveUrl) metaParts.push(`Live: ${cleanUrl(proj.liveUrl)}`);
      if (proj.githubUrl) metaParts.push(`Code: ${cleanUrl(proj.githubUrl)}`);

      if (metaParts.length > 0) {
        doc.font('Helvetica')
          .fontSize(8.5)
          .fillColor('#4B5563')
          .text(metaParts.join(' | '));
      }

      if (proj.description) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#374151')
          .text(proj.description, { lineGap: 1.5 });
      }

      if (Array.isArray(proj.bulletPoints) && proj.bulletPoints.length > 0) {
        renderBulletPoints(doc, proj.bulletPoints, 9);
      }
    });
  }

  // Certifications
  if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    renderAtsSectionHeader(doc, 'CERTIFICATIONS & LICENSES');
    resume.certifications.forEach(cert => {
      const certLine = [
        cert.name,
        cert.issuingOrganization,
        cert.issueDate ? `(${cert.issueDate})` : null
      ].filter(Boolean).join(' — ');

      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#1F2937')
        .text(`• ${certLine}`);
    });
  }

  // Custom Sections
  if (Array.isArray(resume.customSections) && resume.customSections.length > 0) {
    resume.customSections.forEach(section => {
      if (section.heading && section.content) {
        renderAtsSectionHeader(doc, section.heading.toUpperCase());
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#374151')
          .text(section.content);
      }
    });
  }
}

/**
 * ============================================================================
 * MODERN TECHNICAL TEMPLATE
 * Accent colors, modern typography, stylish header banner line
 * ============================================================================
 */
function renderModernTemplate(doc, resume) {
  const p = resume.personalInfo || {};
  const primaryColor = '#1E3A8A'; // Deep Indigo
  const accentColor = '#3B82F6';  // Bright Blue

  // Top Accent Bar
  doc.rect(40, 36, doc.page.width - 80, 4).fill(primaryColor);
  doc.y = 48;

  // Header
  doc.font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(primaryColor)
    .text(p.fullName || 'Candidate Name', { align: 'left' });

  if (resume.targetRole || p.summary) {
    doc.font('Helvetica')
      .fontSize(10.5)
      .fillColor(accentColor)
      .text(resume.targetRole || 'Software Engineer', { align: 'left' });
  }

  // Contact line
  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.linkedinUrl ? cleanUrl(p.linkedinUrl) : null,
    p.githubUrl ? cleanUrl(p.githubUrl) : null
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.moveDown(0.3);
    doc.font('Helvetica')
      .fontSize(8.5)
      .fillColor('#64748B')
      .text(contactParts.join('  •  '));
  }

  doc.moveDown(0.4);

  // Summary
  if (p.summary && p.summary.trim()) {
    renderModernSectionHeader(doc, 'About Me', primaryColor);
    doc.font('Helvetica')
      .fontSize(9.5)
      .fillColor('#334155')
      .text(p.summary.trim(), { lineGap: 2 });
  }

  // Technical Skills
  if (Array.isArray(resume.skills) && resume.skills.length > 0) {
    renderModernSectionHeader(doc, 'Technical Expertise', primaryColor);
    const grouped = {};
    resume.skills.forEach(skill => {
      const cat = skill.category || 'Technologies';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill.name);
    });

    Object.entries(grouped).forEach(([cat, list]) => {
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text(`${cat}: `, { continued: true })
        .font('Helvetica')
        .fillColor('#334155')
        .text(list.join('  |  '));
    });
  }

  // Experience
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    renderModernSectionHeader(doc, 'Work Experience', primaryColor);
    resume.experience.forEach((exp, idx) => {
      if (idx > 0) doc.moveDown(0.4);

      const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' — ');
      renderTwoColumnRow(doc, exp.role, dates, 'Helvetica-Bold', 'Helvetica', 10, primaryColor, '#64748B');

      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#475569')
        .text([exp.company, exp.location].filter(Boolean).join(' • '));

      if (exp.description) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#334155')
          .text(exp.description);
      }

      if (Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0) {
        renderBulletPoints(doc, exp.bulletPoints, 9);
      }
    });
  }

  // Projects
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    renderModernSectionHeader(doc, 'Key Projects', primaryColor);
    resume.projects.forEach((proj, idx) => {
      if (idx > 0) doc.moveDown(0.4);

      const dates = [proj.startDate, proj.endDate].filter(Boolean).join(' — ');
      renderTwoColumnRow(doc, proj.title, dates, 'Helvetica-Bold', 'Helvetica', 10, primaryColor, '#64748B');

      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        doc.font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor(accentColor)
          .text(`Technologies: ${proj.technologies.join(', ')}`);
      }

      if (proj.description) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor('#334155')
          .text(proj.description);
      }

      if (Array.isArray(proj.bulletPoints) && proj.bulletPoints.length > 0) {
        renderBulletPoints(doc, proj.bulletPoints, 9);
      }
    });
  }

  // Education
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    renderModernSectionHeader(doc, 'Education', primaryColor);
    resume.education.forEach((edu, idx) => {
      if (idx > 0) doc.moveDown(0.3);

      const years = [edu.startYear, edu.endYear].filter(Boolean).join(' — ');
      renderTwoColumnRow(doc, edu.institution, years, 'Helvetica-Bold', 'Helvetica', 9.5, '#1E293B', '#64748B');

      const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#475569')
        .text([degreeLine, edu.grade ? `CGPA: ${edu.grade}` : null].filter(Boolean).join(' • '));
    });
  }

  // Certifications
  if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    renderModernSectionHeader(doc, 'Certifications', primaryColor);
    resume.certifications.forEach(cert => {
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#334155')
        .text(`• ${cert.name} — ${cert.issuingOrganization} ${cert.issueDate ? `(${cert.issueDate})` : ''}`);
    });
  }
}

/**
 * ============================================================================
 * CLASSIC TEMPLATE
 * Traditional serif style with centered headers and elegant divider rules
 * ============================================================================
 */
function renderClassicTemplate(doc, resume) {
  const p = resume.personalInfo || {};

  // Header: Centered serif
  doc.font('Times-Bold')
    .fontSize(19)
    .fillColor('#111827')
    .text((p.fullName || 'Candidate Name').toUpperCase(), { align: 'center' });

  // Contact info
  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.linkedinUrl ? cleanUrl(p.linkedinUrl) : null,
    p.githubUrl ? cleanUrl(p.githubUrl) : null
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.moveDown(0.3);
    doc.font('Times-Roman')
      .fontSize(9.5)
      .fillColor('#374151')
      .text(contactParts.join('  •  '), { align: 'center' });
  }

  // Summary
  if (p.summary && p.summary.trim()) {
    renderClassicSectionHeader(doc, 'OBJECTIVE / SUMMARY');
    doc.font('Times-Roman')
      .fontSize(9.5)
      .fillColor('#1F2937')
      .text(p.summary.trim(), { lineGap: 2 });
  }

  // Education
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    renderClassicSectionHeader(doc, 'EDUCATION');
    resume.education.forEach((edu, idx) => {
      if (idx > 0) doc.moveDown(0.35);

      const years = [edu.startYear, edu.endYear].filter(Boolean).join(' - ');
      renderTwoColumnRow(doc, edu.institution, years, 'Times-Bold', 'Times-Bold', 10);

      const degreeLine = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
      doc.font('Times-Italic')
        .fontSize(9)
        .fillColor('#374151')
        .text([degreeLine, edu.grade ? `Grade: ${edu.grade}` : null].filter(Boolean).join(' — '));
    });
  }

  // Experience
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    renderClassicSectionHeader(doc, 'PROFESSIONAL EXPERIENCE');
    resume.experience.forEach((exp, idx) => {
      if (idx > 0) doc.moveDown(0.4);

      const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
      renderTwoColumnRow(doc, exp.role, dates, 'Times-Bold', 'Times-Roman', 10);

      doc.font('Times-Italic')
        .fontSize(9)
        .fillColor('#4B5563')
        .text([exp.company, exp.location].filter(Boolean).join(', '));

      if (exp.description) {
        doc.font('Times-Roman')
          .fontSize(9)
          .fillColor('#1F2937')
          .text(exp.description);
      }

      if (Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0) {
        renderBulletPoints(doc, exp.bulletPoints, 9, 'Times-Roman');
      }
    });
  }

  // Projects
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    renderClassicSectionHeader(doc, 'PROJECTS');
    resume.projects.forEach((proj, idx) => {
      if (idx > 0) doc.moveDown(0.4);

      const dates = [proj.startDate, proj.endDate].filter(Boolean).join(' - ');
      renderTwoColumnRow(doc, proj.title, dates, 'Times-Bold', 'Times-Roman', 10);

      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        doc.font('Times-Italic')
          .fontSize(9)
          .fillColor('#4B5563')
          .text(`Technologies: ${proj.technologies.join(', ')}`);
      }

      if (proj.description) {
        doc.font('Times-Roman')
          .fontSize(9)
          .fillColor('#1F2937')
          .text(proj.description);
      }

      if (Array.isArray(proj.bulletPoints) && proj.bulletPoints.length > 0) {
        renderBulletPoints(doc, proj.bulletPoints, 9, 'Times-Roman');
      }
    });
  }

  // Skills
  if (Array.isArray(resume.skills) && resume.skills.length > 0) {
    renderClassicSectionHeader(doc, 'SKILLS');
    const grouped = {};
    resume.skills.forEach(skill => {
      const cat = skill.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(skill.name);
    });

    Object.entries(grouped).forEach(([cat, list]) => {
      doc.font('Times-Bold')
        .fontSize(9)
        .fillColor('#111827')
        .text(`${cat}: `, { continued: true })
        .font('Times-Roman')
        .fillColor('#374151')
        .text(list.join(', '));
    });
  }

  // Certifications
  if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    renderClassicSectionHeader(doc, 'CERTIFICATIONS');
    resume.certifications.forEach(cert => {
      doc.font('Times-Roman')
        .fontSize(9)
        .fillColor('#374151')
        .text(`• ${cert.name} — ${cert.issuingOrganization}`);
    });
  }
}

/**
 * Helper: Render ATS Section Header with standard underline rule
 */
function renderAtsSectionHeader(doc, title) {
  doc.moveDown(0.7);
  doc.font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#111827')
    .text(title);

  const y = doc.y + 1;
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#9CA3AF').lineWidth(0.75).stroke();
  doc.moveDown(0.3);
}

/**
 * Helper: Render Modern Section Header with subtle colored rule
 */
function renderModernSectionHeader(doc, title, primaryColor) {
  doc.moveDown(0.7);
  doc.font('Helvetica-Bold')
    .fontSize(11.5)
    .fillColor(primaryColor)
    .text(title.toUpperCase());

  const y = doc.y + 1;
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#CBD5E1').lineWidth(1).stroke();
  doc.moveDown(0.3);
}

/**
 * Helper: Render Classic Section Header
 */
function renderClassicSectionHeader(doc, title) {
  doc.moveDown(0.7);
  doc.font('Times-Bold')
    .fontSize(11)
    .fillColor('#111827')
    .text(title);

  const y = doc.y + 1;
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor('#4B5563').lineWidth(0.5).stroke();
  doc.moveDown(0.3);
}

/**
 * Helper: Render a 2-column row (Left Title, Right Date/Location)
 */
function renderTwoColumnRow(doc, leftText, rightText, leftFont = 'Helvetica-Bold', rightFont = 'Helvetica', fontSize = 10, leftColor = '#111827', rightColor = '#4B5563') {
  const currentY = doc.y;
  doc.font(leftFont).fontSize(fontSize).fillColor(leftColor).text(leftText || '', 40, currentY, { width: 340 });
  if (rightText) {
    doc.font(rightFont).fontSize(fontSize * 0.9).fillColor(rightColor).text(rightText, 380, currentY, { width: doc.page.width - 420, align: 'right' });
  }
  doc.y = Math.max(doc.y, currentY + fontSize + 2);
}

/**
 * Helper: Render bullet points
 */
function renderBulletPoints(doc, bullets, fontSize = 9, fontName = 'Helvetica') {
  bullets.forEach(point => {
    if (point && point.trim()) {
      doc.font(fontName)
        .fontSize(fontSize)
        .fillColor('#374151')
        .text(`•   ${point.trim()}`, 50, doc.y, {
          width: doc.page.width - 90,
          lineGap: 1.5
        });
    }
  });
}

/**
 * Helper: Clean URL for display
 */
function cleanUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

module.exports = {
  generatePdfBuffer
};
