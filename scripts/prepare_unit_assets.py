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


def keep_largest_component(image: Image.Image) -> Image.Image:
    """로고·문구·장식선을 제외하기 위해 가장 큰 캐릭터 성분만 남긴다."""
    width, height = image.size
    alpha = image.getchannel("A")
    pixels = alpha.load()
    visited = bytearray(width * height)
    largest: list[tuple[int, int]] = []
    for start_y in range(height):
        for start_x in range(width):
            start = start_y * width + start_x
            if visited[start] or pixels[start_x, start_y] == 0:
                continue
            component = []
            stack = [(start_x, start_y)]
            visited[start] = 1
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    index = ny * width + nx
                    if 0 <= nx < width and 0 <= ny < height and not visited[index] and pixels[nx, ny] > 0:
                        visited[index] = 1
                        stack.append((nx, ny))
            if len(component) > len(largest):
                largest = component
    retained = set(largest)
    rgba = image.load()
    for y in range(height):
        for x in range(width):
            if (x, y) not in retained:
                rgba[x, y] = (*rgba[x, y][:3], 0)
    return image
for name, filename in SOURCES.items():
    image = keep_largest_component(remove_edge_connected_white(Image.open(ROOT / "reference" / "SD Characters" / filename)))
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box:
        image = image.crop(box)
    canvas = Image.new("RGBA", (512, 512))
    image.thumbnail((448, 448), Image.Resampling.LANCZOS)
    canvas.alpha_composite(image, ((512-image.width)//2, (512-image.height)//2))
    canvas.save(ROOT / "public" / "units" / f"{name}.webp", "WEBP", lossless=True)
