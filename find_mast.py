from PIL import Image
import urllib.request
from io import BytesIO

url = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYDVoRnmkwz7tzJ8gCbdCE2MTCDkCpthRnaD6finiz_qOS43Y03FBorL9bje9AuhFswztA8TPBP0F_71PzHCbfJTlWUq_wA7AB6HdsD78n7vcEnkvS6mIdJcbeR6RWGa5S-Osnpz0qV0i4HEFBsVmmky5EWCeK6av8Xr-BRzRL_6RCHIAP4btmmRayw9E/s320/Helikopter%20Biru.png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as url_response:
    img = Image.open(BytesIO(url_response.read())).convert("RGBA")

width, height = img.size
print(f"Image size: {width}x{height}")

# Scan for dark pixels (the mast) in the top half
mast_pixels = []
for y in range(10, 100):
    for x in range(30, width - 30):
        r, g, b, a = img.getpixel((x, y))
        if a > 200 and r < 40 and g < 40 and b < 40:
            mast_pixels.append((x, y))

# Sort by Y ascending to find the tip
mast_pixels.sort(key=lambda p: p[1])
print("Top 10 mast pixels:", mast_pixels[:10])

# Average X of the top 3 pixels to get the center of the tip
if mast_pixels:
    top_pixels = mast_pixels[:3]
    avg_x = sum(p[0] for p in top_pixels) / len(top_pixels)
    avg_y = sum(p[1] for p in top_pixels) / len(top_pixels)
    print(f"Mast tip center: X={avg_x} ({avg_x/width*100:.2f}%), Y={avg_y} ({avg_y/height*100:.2f}%)")
