from pathlib import Path
from PIL import Image
import shutil

# CONFIG
IMAGE_SOURCE = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\assets\images"
WEBP_OUTPUT = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\assets\webp"

HTML_SOURCE = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website"
HTML_OUTPUT = r"C:\Users\Divyam Shah\OneDrive\Desktop\Dynamic Labz\DynamicLabz_New_Website\Dynamic_Labz-website\html_webp"

SUPPORTED_EXTS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".gif",
    ".tiff",
    ".tif",
    ".webp"
}


def convert_images():
    source = Path(IMAGE_SOURCE)
    output = Path(WEBP_OUTPUT)

    for img_file in source.rglob("*"):
        if img_file.suffix.lower() not in SUPPORTED_EXTS:
            continue

        relative_path = img_file.relative_to(source)
        webp_path = output / relative_path.with_suffix(".webp")

        webp_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with Image.open(img_file) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")

                img.save(webp_path, "WEBP", quality=85, method=6)

            print(f"✓ {img_file}")

        except Exception as e:
            print(f"✗ Failed: {img_file} -> {e}")


def update_html():
    source = Path(HTML_SOURCE)
    output = Path(HTML_OUTPUT)

    if output.exists():
        shutil.rmtree(output)

    output.mkdir(parents=True)

    for html_file in source.rglob("*.html"):

        content = html_file.read_text(
            encoding="utf-8",
            errors="ignore"
        )

        for ext in SUPPORTED_EXTS:
            content = content.replace(ext, ".webp")

        content = content.replace(
            IMAGE_SOURCE.replace("\\", "/"),
            WEBP_OUTPUT.replace("\\", "/")
        )

        relative = html_file.relative_to(source)
        new_file = output / relative

        new_file.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        new_file.write_text(
            content,
            encoding="utf-8"
        )

        print(f"✓ Updated HTML: {html_file}")


if __name__ == "__main__":
    convert_images()
    update_html()

    print("\nDone.")