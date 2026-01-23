/**
 * Simple PDF Generator using existing jspdf + html2canvas
 * No new dependencies needed!
 * 
 * @module utils/simplePdfGenerator
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Convert HTML element to PDF
 * @param {string} elementId - ID of element to convert
 * @param {string} filename - Output filename
 * @param {Object} options - Configuration options
 * @param {number} options.scale - Canvas scale (higher = better quality)
 * @param {string} options.backgroundColor - Background color
 * @param {boolean} options.multiPage - Enable multi-page PDFs
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Result object with success status
 */
export const generatePDFFromElement = async (
  elementId, 
  filename, 
  options = {}
) => {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
    multiPage = true,
    onProgress = null
  } = options;

  try {
    if (onProgress) onProgress('Preparing report...');
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Store original overflow style
    const originalOverflow = element.style.overflow;
    element.style.overflow = 'visible';

    // Capture element as canvas
    if (onProgress) onProgress('Capturing content...');
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Restore original overflow
    element.style.overflow = originalOverflow;

    // Create PDF
    if (onProgress) onProgress('Creating PDF...');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    if (multiPage) {
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    // Download PDF
    if (onProgress) onProgress('Downloading...');
    pdf.save(filename);
    
    if (onProgress) onProgress('Complete!');
    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate PDF with custom page setup
 * More control over page margins and orientation
 * 
 * @param {string} elementId - ID of element to convert
 * @param {string} filename - Output filename
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Result object
 */
export const generateCustomPDF = async (elementId, filename, options = {}) => {
  const {
    orientation = 'portrait', // 'portrait' or 'landscape'
    format = 'a4',
    margins = { top: 10, right: 10, bottom: 10, left: 10 },
    scale = 2,
    onProgress = null
  } = options;

  try {
    if (onProgress) onProgress('Preparing report...');
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Capture element
    if (onProgress) onProgress('Capturing content...');
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Create PDF with custom settings
    if (onProgress) onProgress('Creating PDF...');
    const pdf = new jsPDF(orientation, 'mm', format);
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - margins.left - margins.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = margins.top;
    let heightLeft = imgHeight;
    const pageContentHeight = pdfHeight - margins.top - margins.bottom;

    // Add image to first page
    pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight);
    heightLeft -= pageContentHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margins.top;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight);
      heightLeft -= pageContentHeight;
    }

    // Download PDF
    if (onProgress) onProgress('Downloading...');
    pdf.save(filename);
    
    if (onProgress) onProgress('Complete!');
    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate PDF with letterhead
 * Adds school branding to the report before conversion
 * 
 * @param {string} elementId - ID of element to convert
 * @param {string} filename - Output filename
 * @param {Object} schoolInfo - School information for letterhead
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Result object
 */
export const generatePDFWithLetterhead = async (
  elementId, 
  filename, 
  schoolInfo = {},
  options = {}
) => {
  const {
    schoolName = 'Zawadi JRN Academy',
    address = 'P.O. Box 1234, Nairobi, Kenya',
    phone = '+254 700 000000',
    email = 'info@zawadijrn.ac.ke',
    website = 'www.zawadijrn.ac.ke',
    logoUrl = '/logo-zawadi.png',
    brandColor = '#1e3a8a'
  } = schoolInfo;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create temporary wrapper with letterhead
    const wrapper = document.createElement('div');
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Arial, sans-serif';

    // Add letterhead
    const letterhead = `
      <div style="text-align: center; padding: 20px; border-bottom: 3px solid ${brandColor}; margin-bottom: 20px;">
        <img src="${logoUrl}" alt="School Logo" style="height: 60px; margin-bottom: 10px;" crossorigin="anonymous" />
        <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: bold; color: ${brandColor}; letter-spacing: 1px;">
          ${schoolName.toUpperCase()}
        </h1>
        <p style="margin: 3px 0; font-size: 11px; color: #666;">${address}</p>
        <p style="margin: 3px 0; font-size: 11px; color: #666;">Tel: ${phone} | Email: ${email}</p>
        <p style="margin: 3px 0; font-size: 11px; color: ${brandColor};">${website}</p>
      </div>
    `;

    // Clone element content
    const contentClone = element.cloneNode(true);
    
    // Assemble wrapper
    wrapper.innerHTML = letterhead;
    wrapper.appendChild(contentClone);

    // Temporarily add to document
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    document.body.appendChild(wrapper);

    // Generate PDF from wrapper
    const canvas = await html2canvas(wrapper, {
      scale: options.scale || 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false
    });

    // Remove temporary wrapper
    document.body.removeChild(wrapper);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add pages
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Add footer with page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdf.internal.pageSize.getWidth() - 20,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
      pdf.text(
        `Generated: ${new Date().toLocaleDateString('en-GB')}`,
        10,
        pdf.internal.pageSize.getHeight() - 10
      );
    }

    // Download
    pdf.save(filename);
    
    return { success: true };
  } catch (error) {
    console.error('PDF generation with letterhead error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Quick print function - opens print dialog
 * No PDF generation, just direct browser print
 * 
 * @param {string} elementId - ID of element to print
 * @returns {Promise<Object>} Result object
 */
export const quickPrint = async (elementId) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Store original content
    const originalContent = document.body.innerHTML;
    const printContent = element.innerHTML;

    // Replace body with print content
    document.body.innerHTML = printContent;

    // Trigger print
    window.print();

    // Restore original content
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore event listeners

    return { success: true };
  } catch (error) {
    console.error('Quick print error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch generate PDFs for multiple learners
 * Useful for end-of-term report generation
 * 
 * @param {Array} learners - Array of learner objects
 * @param {Function} reportGenerator - Function that generates report HTML for a learner
 * @param {string} reportType - Type of report (for filename)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Result object
 */
export const batchGeneratePDFs = async (
  learners,
  reportGenerator,
  reportType,
  onProgress = null
) => {
  const results = {
    success: [],
    failed: [],
    total: learners.length
  };

  for (let i = 0; i < learners.length; i++) {
    const learner = learners[i];
    
    if (onProgress) {
      onProgress(`Processing ${learner.firstName} ${learner.lastName} (${i + 1}/${learners.length})`);
    }

    try {
      // Generate report HTML
      const reportHTML = reportGenerator(learner);
      
      // Create temporary element
      const tempDiv = document.createElement('div');
      tempDiv.id = `temp-report-${learner.id}`;
      tempDiv.innerHTML = reportHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Generate PDF
      const filename = `${learner.firstName}_${learner.lastName}_${reportType}.pdf`;
      await generatePDFFromElement(`temp-report-${learner.id}`, filename, {
        scale: 2,
        multiPage: true
      });

      // Clean up
      document.body.removeChild(tempDiv);

      results.success.push(learner);
    } catch (error) {
      console.error(`Failed to generate PDF for ${learner.firstName}:`, error);
      results.failed.push({ learner, error: error.message });
    }

    // Small delay to prevent browser from freezing
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (onProgress) {
    onProgress('Complete!');
  }

  return results;
};

export default {
  generatePDFFromElement,
  generateCustomPDF,
  generatePDFWithLetterhead,
  quickPrint,
  batchGeneratePDFs
};
