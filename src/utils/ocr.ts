import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import Tesseract from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractTextAndImages(files: File[]) {
  const texts: string[] = []
  const imagesBase64: Array<{ data: string; mimeType: string }> = []

  for (const f of files) {
    if (f.type.includes('pdf')) {
      const buffer = await f.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      let txt = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        txt += content.items.map((it: any) => it.str).join(' ') + '\n'

        // Render page to image for Vision models (diagrams/plots/handwriting)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        const dataUrl = canvas.toDataURL('image/png')
        // strip "data:image/png;base64,"
        imagesBase64.push({ data: dataUrl.split(',')[1], mimeType: 'image/png' })
      }
      texts.push(txt)
    } else if (f.type.startsWith('image/')) {
      // OCR image
      const url = URL.createObjectURL(f)
      const { data } = await Tesseract.recognize(url, 'eng')
      texts.push(data.text)
      const base64 = await fileToBase64(f)
      imagesBase64.push({ data: base64, mimeType: f.type })
    } else {
      // Fallback: try as text
      texts.push(await f.text())
    }
  }

  return {
    text: texts.join('\n').trim(),
    images: imagesBase64,
  }
}

async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}