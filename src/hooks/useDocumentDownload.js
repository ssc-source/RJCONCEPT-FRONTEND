import { useCallback } from 'react';
import { generatePDF } from '../utils/generatePDF';

export function useDocumentDownload() {
  const downloadDocument = useCallback(async (elementId, fileName, errorMessage = 'Unable to download document PDF') => {
    try {
      await generatePDF(elementId, fileName);
    } catch (error) {
      throw new Error(error?.message || errorMessage);
    }
  }, []);

  return { downloadDocument };
}
