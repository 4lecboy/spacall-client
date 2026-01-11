// Service image mapping helper
// Add image files inside `assets/services/` and map them here by service `id` or `slug`.
// Example: 'classic-relaxation': require('../assets/services/classic-relaxation.jpg')

import { ImageSourcePropType } from 'react-native';
import { Service } from '../types';

// Map service identifiers to local require(...) images.
// Update these keys to match your service `id` values or use slugs as needed.
export const SERVICE_IMAGE_MAP: Record<string, ImageSourcePropType> = {
    // Example mappings (replace with your actual image filenames and service ids)
    // 'service-id-1': require('../assets/services/classic-relaxation.jpg'),
    // 'service-id-2': require('../assets/services/therapeutic-deep.jpg'),
    // 'classic-massage': require('../assets/services/classic-massage.jpg'),
    '23819b19-74e9-46ca-9672-d993a047e146': require('../assets/services/aromatherapy-upgrade.jpg'),
    'da711225-e7fc-437c-bf46-a20257fff87a': require('../assets/services/hot-stone-massage.jpg'),
    '59fa75c4-2679-463e-ad17-74691d2745ce': require('../assets/services/swedish-massage.jpg'),
    '97b4be0c-cfea-4bee-8d19-a5a50161b791': require('../assets/services/deep-tissue.jpg'),
    '5885b7dd-faa0-4a36-9aaa-5f7aff1a8e72': require('../assets/services/thai-massage.jpg'),
};

/**
 * Returns a local image source for a service, or undefined if none.
 * Passing the service `id` is recommended; fallback to name-based lookup is optional.
 */
export function getServiceImage(service: Service | { id?: string; name?: string }): ImageSourcePropType | undefined {
    const id = service?.id;
    if (id && SERVICE_IMAGE_MAP[id]) return SERVICE_IMAGE_MAP[id];

    // Fallback: try using a slugified name (not required)
    const name = (service as any)?.name || '';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (slug && SERVICE_IMAGE_MAP[slug]) return SERVICE_IMAGE_MAP[slug];

    return undefined;
}
