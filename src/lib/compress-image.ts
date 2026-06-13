// Client-side image downscale + compression, run before uploading.
// Keeps Server Action / proxy request bodies small (phone photos are often several MB)
// so uploads stay fast and never hit the body-size limits.

const MAX_DIM = 1600 // longest edge, in px
const QUALITY = 0.82

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * Returns a downscaled JPEG version of an image file. Non-images (and anything
 * that can't be decoded or wouldn't get smaller) are returned unchanged.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  let img: HTMLImageElement
  try {
    img = await loadImage(file)
  } catch {
    return file // undecodable — let the server reject it if needed
  }

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
  // Already within size and dimensions — no need to re-encode.
  if (scale === 1 && file.size <= 1_000_000) return file

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * scale))
  canvas.height = Math.max(1, Math.round(img.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', QUALITY),
  )
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
