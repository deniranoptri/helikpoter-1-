const https = require('https');
const fs = require('fs');

const urls = {
  blue: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png',
  green: 'https://raw.githubusercontent.com/deniranoptri/media/sibungas/Helikopter%20Hijau.png',
  yellow: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEju5Dt5y3eA3p89ykz9XM1nqyXnlfn4Egiu3KDOb3hCzb18UrUgInfLBGlpbv89CD8yLh1xM_r8WW-kPRHM7EEf7mbjfjaUHMLzO9fS_CokENkTg5Idv_f8asMNVCxJk2fumbCV12N6AtDryfLBijb-NcPHKIOPg_mK2cTXTjYvgs82hq_96e68KMj7fN0/s320/Helikopter%20Kuning.png',
  red: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgZcSbGvMwYlzI8MUXDSW8PzB8C-Z461-SYWqBEhzJiKlj9j4oyf9IqSWuJbV2yfE2Ljf9X_lSPnSHcU-lbqkKQ9vE5cdSvyJYlUxnkeo-WtLyPIUx6PzA3kMZFoiueRrLIWWNFFze6oLSBDY2e3UzvpDZuFUFTC13Nul4vVjnXHGFFalJa9mbnyNhtuiQ/s320/Helikopter%20Merah.png'
};

for (const [name, url] of Object.entries(urls)) {
  https.get(url, (res) => {
    res.pipe(fs.createWriteStream(name + '.png'));
  });
}
