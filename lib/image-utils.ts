
/**
 * Generates an optimized URL for an image stored in Supabase Storage with Image Transformations.
 * 
 * @param url The original image URL (e.g., from product.image_url)
 * @param width The desired width (default: 800)
 * @param quality The quality percentage (default: 80)
 * @param format The target format (default: 'webp')
 * @returns The optimized URL string
 */
export function getOptimizedImageUrl(
    url: string | null | undefined,
    width = 800,
    quality = 80,
    format = 'webp'
): string {
    if (!url) return '';

    // Check if it's likely a Supabase Storage URL
    if (url.includes('storage/v1/object/public')) {
        // Supabase Transform API: Usually handled via /render/image/public or query params depending on setup
        // Standard Supabase Resizing usually appends query params if enabled, 
        // OR uses a different endpoint like /storage/v1/render/image/public/...

        // Assuming standard transformation params if the project supports it (Pro plan or self-hosted with imgproxy)
        // If simply public bucket URL, we append params

        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}&format=${format}`;
    }

    return url;
}
