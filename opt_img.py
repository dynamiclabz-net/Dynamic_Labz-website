from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import os

# =====================================================
# CONFIG
# =====================================================

TARGET_FOLDERS = [
    "assets/images/project_BakersHub",
    "assets/images/project_Barecee",
    "assets/images/project_DiamondFairPrice",
    "assets/images/project_E-Checkup",
    "assets/images/project_E-Hunt",
    "assets/images/project_Jirawala",
    "assets/images/project_JumpinGo",
    "assets/images/project_OvenFresh",
    "assets/images/project_RubyChemicals",
    "assets/images/project_Sanki-Events",
    "assets/images/project_SquareSecond",
    "assets/images/project_TCA",
    "assets/images/project_The-MEWA",
]

OUTPUT_ROOT = "assets/images_optimized"

MAX_WIDTH = 1920
MAX_HEIGHT = 1920

JPEG_QUALITY = 92
WEBP_QUALITY = 92

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
}

# =====================================================
# IMAGE PROCESSING
# =====================================================

def optimize_image(image_path):
    try:
        image_path = Path(image_path)

        relative_path = image_path.relative_to("assets/images")
        output_path = Path(OUTPUT_ROOT) / relative_path

        output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        with Image.open(image_path) as img:

            original_width, original_height = img.size

            scale = min(
                MAX_WIDTH / original_width,
                MAX_HEIGHT / original_height,
                1
            )

            if scale < 1:
                new_size = (
                    int(original_width * scale),
                    int(original_height * scale)
                )

                img = img.resize(
                    new_size,
                    Image.Resampling.LANCZOS
                )

            ext = image_path.suffix.lower()

            if ext == ".png":

                img.save(
                    output_path,
                    optimize=True
                )

            elif ext in [".jpg", ".jpeg"]:

                if img.mode in ("RGBA", "LA", "P"):
                    img = img.convert("RGB")

                img.save(
                    output_path,
                    quality=JPEG_QUALITY,
                    optimize=True
                )

            elif ext == ".webp":

                img.save(
                    output_path,
                    "WEBP",
                    quality=WEBP_QUALITY,
                    method=6
                )

        old_size = image_path.stat().st_size / (1024 * 1024)
        new_size = output_path.stat().st_size / (1024 * 1024)

        return (
            f"✓ {image_path.name} | "
            f"{old_size:.2f} MB -> {new_size:.2f} MB"
        )

    except Exception as e:
        return f"✗ {image_path}: {e}"


# =====================================================
# COLLECT FILES
# =====================================================

all_images = []

for folder in TARGET_FOLDERS:

    folder = Path(folder)

    if not folder.exists():
        print(f"Folder not found: {folder}")
        continue

    for file in folder.rglob("*"):

        if (
            file.is_file()
            and file.suffix.lower()
            in SUPPORTED_EXTENSIONS
        ):
            all_images.append(file)

print(f"\nFound {len(all_images)} images\n")

# =====================================================
# MULTITHREADED EXECUTION
# =====================================================

workers = min(
    32,
    (os.cpu_count() or 4) * 2
)

with ThreadPoolExecutor(
    max_workers=workers
) as executor:

    for result in executor.map(
        optimize_image,
        all_images
    ):
        print(result)

print("\nOptimization complete.")