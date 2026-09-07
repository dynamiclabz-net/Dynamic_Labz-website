from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import os
import shutil

# =====================================================
# CONFIGURATION
# =====================================================

IMAGE_SOURCE = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\assets\images"
WEBP_OUTPUT = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\assets\webp"

HTML_SOURCE = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website"
HTML_OUTPUT = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\html_webp"

WEBP_QUALITY = 92

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".gif",
    ".tif",
    ".tiff",
    ".webp"
}

# =====================================================
# IMAGE CONVERSION
# =====================================================

def convert_single_image(image_path: Path):

    source_root = Path(IMAGE_SOURCE)
    output_root = Path(WEBP_OUTPUT)

    relative_path = image_path.relative_to(source_root)

    output_file = (
        output_root /
        relative_path.with_suffix(".webp")
    )

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if output_file.exists():
        return f"SKIPPED  : {image_path.name}"

    try:

        with Image.open(image_path) as img:

            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            img.save(
                output_file,
                "WEBP",
                quality=WEBP_QUALITY,
                method=6,
                optimize=True
            )

        return f"CONVERTED: {image_path.name}"

    except Exception as e:
        return f"FAILED   : {image_path.name} -> {e}"


def convert_all_images():

    source_root = Path(IMAGE_SOURCE)

    image_files = [
        file
        for file in source_root.rglob("*")
        if file.is_file()
        and file.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    print(f"\nFound {len(image_files)} images\n")

    workers = min(
        32,
        (os.cpu_count() or 4) * 2
    )

    with ThreadPoolExecutor(
        max_workers=workers
    ) as executor:

        for result in executor.map(
            convert_single_image,
            image_files
        ):
            print(result)

# =====================================================
# HTML UPDATER
# =====================================================

def update_html_files():

    source_root = Path(HTML_SOURCE)
    output_root = Path(HTML_OUTPUT)

    if output_root.exists():
        shutil.rmtree(output_root)

    output_root.mkdir(
        parents=True,
        exist_ok=True
    )

    html_files = list(
        source_root.rglob("*.html")
    )

    print(
        f"\nFound {len(html_files)} HTML files\n"
    )

    for html_file in html_files:

        try:

            content = html_file.read_text(
                encoding="utf-8",
                errors="ignore"
            )

            for ext in SUPPORTED_EXTENSIONS:
                content = content.replace(
                    ext,
                    ".webp"
                )

            content = content.replace(
                IMAGE_SOURCE.replace("\\", "/"),
                WEBP_OUTPUT.replace("\\", "/")
            )

            relative_path = html_file.relative_to(
                source_root
            )

            output_file = (
                output_root /
                relative_path
            )

            output_file.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            output_file.write_text(
                content,
                encoding="utf-8"
            )

            print(
                f"UPDATED  : {relative_path}"
            )

        except Exception as e:

            print(
                f"FAILED   : {html_file.name} -> {e}"
            )

# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":

    print("\n=== IMAGE CONVERSION STARTED ===")
    convert_all_images()

    print("\n=== HTML UPDATE STARTED ===")
    update_html_files()

    print("\n=== DONE ===")