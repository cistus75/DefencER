"""공식 SD 원본을 수정하지 않고, 가장자리 연결 흰 배경을 투명화한다."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {"hyunwoo": "3_Hyunwoo.png", "rio": "31_Rio.png", "adina": "52_Adina.png", "leni": "69_Leni.png"}


def remove_edge_connected_white(image: Image.Image) -> Image.Image:
    """흰 배경과 연결된 픽셀만 지워 캐릭터의 밝은 의상은 보존한다."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    visited = bytearray(width * height)
    stack = []

    def is_background(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return red >= 242 and green >= 242 and blue >= 242

    for x in range(width):
        stack.extend(((x, 0), (x, height - 1)))
    for y in range(1, height - 1):
        stack.extend(((0, y), (width - 1, y)))

    while stack:
        x, y = stack.pop()
        index = y * width + x
        if visited[index] or not is_background(x, y):
            continue
        visited[index] = 1
        pixels[x, y] = (*pixels[x, y][:3], 0)
        if x:
            stack.append((x - 1, y))
        if x + 1 < width:
            stack.append((x + 1, y))
        if y:
            stack.append((x, y - 1))
        if y + 1 < height:
            stack.append((x, y + 1))
    return rgba
for name, filename in SOURCES.items():
    image = remove_edge_connected_white(Image.open(ROOT / "reference" / "SD Characters" / filename))
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box:
        image = image.crop(box)
    canvas = Image.new("RGBA", (512, 512))
    image.thumbnail((448, 448), Image.Resampling.LANCZOS)
    canvas.alpha_composite(image, ((512-image.width)//2, (512-image.height)//2))
    canvas.save(ROOT / "public" / "units" / f"{name}.webp", "WEBP", lossless=True)
