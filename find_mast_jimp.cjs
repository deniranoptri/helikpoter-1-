const { Jimp } = require('jimp');

(async () => {
  try {
    const image = await Jimp.read('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    console.log(`Size: ${width}x${height}`);

    let mastPixels = [];
    for (let y = 10; y < 100; y++) {
      for (let x = 30; x < width - 30; x++) {
        const hex = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hex);
        if (rgba.a > 200 && rgba.r < 40 && rgba.g < 40 && rgba.b < 40) {
          mastPixels.push({ x, y });
        }
      }
    }

    mastPixels.sort((a, b) => a.y - b.y);
    console.log("Top 10 mast pixels:", mastPixels.slice(0, 10));

    if (mastPixels.length > 0) {
      const top = mastPixels.slice(0, 3);
      const avgX = top.reduce((sum, p) => sum + p.x, 0) / top.length;
      const avgY = top.reduce((sum, p) => sum + p.y, 0) / top.length;
      console.log(`Mast tip: X=${avgX} (${(avgX / width * 100).toFixed(2)}%), Y=${avgY} (${(avgY / height * 100).toFixed(2)}%)`);
    }
  } catch (e) {
    console.error(e);
  }
})();
