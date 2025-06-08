import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Usa una CDN o la ruta local si quieres importar el worker desde node_modules
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Convierte el primer page de un archivo PDF a una imagen PNG.
 * @param pdfFile Archivo PDF (tipo File o Blob)
 * @returns File convertido en PNG
 */
export async function convertPdfToImage(pdfFile: File): Promise<File> {
  const pdfData = await pdfFile.arrayBuffer();
  const pdf = await getDocument({ data: pdfData }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  const blob: Blob = await new Promise(resolve =>
    canvas.toBlob(resolve as BlobCallback, 'image/png')!
  );

  return new File([blob], 'menu.png', { type: 'image/png' });
}
