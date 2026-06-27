export async function generatePDF(elementId, fileName) {
  const target = document.getElementById(elementId);
  if (!target) {
    throw new Error('PDF content not found');
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let yOffset = 0;
  let remainingHeight = imageHeight;

  pdf.addImage(imageData, 'PNG', 0, yOffset, imageWidth, imageHeight, undefined, 'FAST');
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    yOffset -= pageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, yOffset, imageWidth, imageHeight, undefined, 'FAST');
    remainingHeight -= pageHeight;
  }

  const resolvedName = fileName?.endsWith('.pdf') ? fileName : `${fileName || 'document'}.pdf`;
  pdf.save(resolvedName);
}
