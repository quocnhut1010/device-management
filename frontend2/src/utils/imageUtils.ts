/**
 * Utility function to construct full image URL from relative path
 * Backend returns image URLs as relative paths like "/images/devices/xxx.jpg"
 * This function combines it with the base URL (without /api)
 */

/**
 * Get the base URL for images (backend base URL without /api)
 */
const getImageBaseUrl = (): string => {
  // Try VITE_API_BASE_URL first (if explicitly set for images)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return apiBaseUrl
  }

  // Fallback to VITE_API_URL and remove /api if present
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5264/api'
  
  // Remove /api from the end if present
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4) // Remove '/api'
  }
  
  // If it ends with '/api/', remove that
  if (apiUrl.endsWith('/api/')) {
    return apiUrl.slice(0, -5) // Remove '/api/'
  }
  
  return apiUrl
}

/**
 * Construct full image URL from relative path
 * @param relativePath - Relative path from backend (e.g., "/images/devices/xxx.jpg")
 * @returns Full URL for the image
 */
export const getImageUrl = (relativePath: string | null | undefined): string => {
  // Return empty string if no path provided
  if (!relativePath) {
    return ''
  }

  // If already a full URL (starts with http:// or https://), return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  // Get base URL and ensure it doesn't end with /
  const baseUrl = getImageBaseUrl().replace(/\/$/, '')
  
  // Ensure relativePath starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  
  // Combine base URL + path
  return `${baseUrl}${path}`
}

