
import type { ImageData } from '../types.ts';
// We now import from a TypeScript module (`data.ts`), which is more robust
// in this environment than importing a JSON file directly. This resolves module resolution errors.
import jsonData from '../data.ts';

/**
 * Loads the image and location data from the local data module.
 * This is a synchronous operation.
 */
export const getImageData = (): ImageData[] => {
  // The imported data is already correctly typed, so no assertion is needed.
  return jsonData;
};