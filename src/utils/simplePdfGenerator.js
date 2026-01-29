/**
 * Simple PDF Generator using existing jspdf + html2canvas
 * No new dependencies needed!
 * 
 * @module utils/simplePdfGenerator
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to convert image URL to Base64
 * This ensures images are fully loaded and renderable by html2canvas
 */
const convertImageToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return url; // Return original URL if conversion fails
  }
};

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
    orientation = 'portrait',
    onProgress = null
  } = options;

  const {
    schoolName = 'Zawadi JRN Academy',
    address = 'P.O. Box 1234, Nairobi, Kenya',
    phone = '+254 700 000000',
    email = 'info@zawadijrn.ac.ke',
    website = 'www.zawadijrn.ac.ke',
    logoUrl = '/logo-zawadi.png',
    brandColor = '#1e3a8a',
    skipLetterhead = false
  } = schoolInfo;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // CRITICAL FIX: Make print-only elements visible before capturing
    const printOnlyElements = element.querySelectorAll('.print-only');
    const noPrintElements = element.querySelectorAll('.no-print');
    
    // Store original styles
    const originalStyles = new Map();
    printOnlyElements.forEach(el => {
      originalStyles.set(el, {
        display: el.style.display,
        visibility: el.style.visibility
      });
      el.style.display = 'block';
      el.style.visibility = 'visible';
    });
    
    // Hide no-print elements
    const noPrintOriginalStyles = new Map();
    noPrintElements.forEach(el => {
      noPrintOriginalStyles.set(el, el.style.display);
      el.style.display = 'none';
    });

    // Convert logo to Base64 to ensure it renders correctly in PDF
    // html2canvas often fails with external images or relative paths if not preloaded
    let processedLogoUrl = logoUrl;
    if (logoUrl && !logoUrl.startsWith('data:')) {
      if (options.onProgress) options.onProgress('Processing logo...', 10);
      processedLogoUrl = await convertImageToBase64(logoUrl);
    }

    // Create temporary wrapper with letterhead
    const wrapper = document.createElement('div');
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Arial, sans-serif';

    // Add letterhead - Compact Professional Layout
    const letterhead = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 0 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${brandColor}; padding-bottom: 10px; margin-bottom: 15px;">
          
          <!-- Logo Section -->
          <div style="flex-shrink: 0;">
            <img src="${processedLogoUrl}" alt="School Logo" style="height: 60px; width: auto; object-fit: contain;" crossorigin="anonymous" />
          </div>

          <!-- School Details Section -->
          <div style="text-align: right; flex-grow: 1; padding-left: 15px;">
            <h1 style="margin: 0 0 2px 0; font-size: 22px; font-weight: 800; color: ${brandColor}; letter-spacing: -0.5px; text-transform: uppercase;">
              ${schoolName}
            </h1>
            <div style="font-size: 10px; line-height: 1.3; color: #555;">
              <p style="margin: 0;">${address}</p>
              <p style="margin: 0;"><strong>Tel:</strong> ${phone} &nbsp;|&nbsp; <strong>Email:</strong> ${email}</p>
              <p style="margin: 0;"><a href="${website}" style="color: ${brandColor}; text-decoration: none;">${website}</a></p>
            </div>
          </div>
          
        </div>
      </div>
    `;

    // Clone element content
    if (options.onProgress) options.onProgress('Preparing document layout...', 20);
    const contentClone = element.cloneNode(true);

    // CRITICAL: Make print-only visible in the CLONE
    const clonedPrintOnly = contentClone.querySelectorAll('.print-only');
    console.log('PDF Generator: Found', clonedPrintOnly.length, 'print-only elements in clone');
    
    clonedPrintOnly.forEach(el => {
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
    });

    // Hide no-print in the clone
    const clonedNoPrint = contentClone.querySelectorAll('.no-print');
    clonedNoPrint.forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });

    // Assemble wrapper
    if (skipLetterhead) {
      wrapper.innerHTML = '';
      wrapper.style.padding = '0'; // Let the element handle its own padding
    } else {
      wrapper.innerHTML = letterhead;
    }
    wrapper.appendChild(contentClone);

    // Temporarily add to document
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.width = orientation === 'landscape' ? '297mm' : '210mm';
    document.body.appendChild(wrapper);

    // Add a small delay to ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate PDF from wrapper
    if (options.onProgress) options.onProgress('Rendering high-quality image...', 40);
    const canvas = await html2canvas(wrapper, {
      scale: options.scale || 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      onclone: (clonedDoc) => {
        // Optional: specific tweaks to cloned document before rendering
      }
    });

    // Remove temporary wrapper
    document.body.removeChild(wrapper);

    // Restore original styles
    printOnlyElements.forEach(el => {
      const original = originalStyles.get(el);
      el.style.display = original.display;
      el.style.visibility = original.visibility;
    });
    
    noPrintElements.forEach(el => {
      el.style.display = noPrintOriginalStyles.get(el);
    });

    // Create PDF
    if (onProgress) onProgress('Compiling PDF pages...', 70);
    const imgData = canvas.toDataURL('image/png');

    // PDF Dimensions
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale image to fit page width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;


    // Add pages
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Add footer with page numbers
    if (options.onProgress) options.onProgress('Adding professional finish...', 90);
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128); // Gray text

      // Footer Line
      pdf.setDrawColor(230, 230, 230);
      pdf.line(10, pdfHeight - 15, pdfWidth - 10, pdfHeight - 15);


      // Page Number
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdfWidth - 20,
        pdfHeight - 10,
        { align: 'right' }
      );


      // Generation Date & Copyright
      pdf.text(
        `Generated: ${new Date().toLocaleString('en-GB')} | © ${new Date().getFullYear()} ${schoolName}`,
        10,
        pdfHeight - 10
      );

    }

    // Download
    if (options.onProgress) options.onProgress('Finalizing download...', 100);
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

const simplePdf = {
  generatePDFFromElement,
  generateCustomPDF,
  generatePDFWithLetterhead,
  quickPrint,
  batchGeneratePDFs
};
export default simplePdf;
