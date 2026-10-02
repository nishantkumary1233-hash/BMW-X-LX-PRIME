/**
 * Authentic 3D Wingo ball spheres from LX Predictor
 */
export const BALL_IMAGES: Record<number, string> = {
  0: 'https://i.postimg.cc/vZsq9nGm/num0-4-10.png',
  1: 'https://i.postimg.cc/mDt8RNyD/num0-4-6.png',
  2: 'https://i.postimg.cc/ryRQPjmw/num0-4-9.png',
  3: 'https://i.postimg.cc/HLP9S81T/num0-4-1.png',
  4: 'https://i.postimg.cc/K80Pz3zL/num0-4-2.png',
  5: 'https://i.postimg.cc/jj9y6Vyd/num0-4-11.png',
  6: 'https://i.postimg.cc/gjyRPnQV/num0-4-12.png',
  7: 'https://i.postimg.cc/NfYmkk2T/num0-4-4.png',
  8: 'https://i.postimg.cc/vHz9qxWb/num0-4-5.png',
  9: 'https://i.postimg.cc/wBtmjWnY/num0-4-7.png',
};

// Preload ball images in browser cache for instantaneous render
export function preloadBallImages() {
  if (typeof window === 'undefined') return;
  Object.values(BALL_IMAGES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
