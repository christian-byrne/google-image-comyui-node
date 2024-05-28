import torch
import os
import sys
import json
import numpy as np
from pathlib import Path
from PIL import Image, ImageOps
import random

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from .web_scrape.ddg import DuckDuckGoImageScraper

from typing import Union, Tuple


class ImageScraperNode:
    OPTIONS_ = {
        "safesearch": (["on", "moderate", "off", "Random"], {"default": "off"}),
        "size": (
            ["any", "Small", "Medium", "Large", "Wallpaper", "Random"],
            {"default": "any"},
        ),
        "time_period": (
            ["Day", "Week", "Month", "Year", "any", "Random"],
            {"default": "any"},
        ),
        "color": (
            [
                "any",
                "Monochrome",
                "Red",
                "Orange",
                "Yellow",
                "Green",
                "Blue",
                "Purple",
                "Pink",
                "Brown",
                "Black",
                "Gray",
                "Teal",
                "White",
                "Random",
            ],
            {"default": "any"},
        ),
        "type_image": (
            ["any", "photo", "clipart", "gif", "transparent", "line", "Random"],
            {"default": "photo"},
        ),
        "layout": (["any", "Square", "Tall", "Wide", "Random"], {"default": "any"}),
        "license_image": (
            [
                "any",
                "Public",
                "Share",
                "ShareCommercially",
                "Modify",
                "ModifyCommercially",
                "Random",
            ],
            {"default": "any"},
        ),
        "region": (
            ["wt-wt", "us-en", "uk-en", "ru-ru", "Random"],
            {"default": "us-en"},
        ),
    }

    @classmethod
    def INPUT_TYPES(cls):
        required = {
            "search_phrase": (
                "STRING",
                {
                    "default": "a golden retriever puppy",
                    "multiline": True,
                },
            ),
        }
        required.update(cls.OPTIONS_)
        return {
            "required": required,
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
                "output_text": (
                    "STRING",
                    {
                        "default": "",
                    },
                ),
            },
        }

    FUNCTION = "main"
    OUTPUT_NODE = True
    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("image", "mask")
    CATEGORY = "Web Scraping"

    def main(
        self,
        output_text: str = "",
        unique_id=None,
        extra_pnginfo=None,
        **kwargs,
    ):
        def pop_until_not_random(options: list):
            option = options.pop()
            if option == "Random":
                return pop_until_not_random(options)
            return option

        for key, value in kwargs.items():
            if value == "Random":
                random.shuffle(self.OPTIONS_[key][0])
                kwargs[key] = pop_until_not_random(self.OPTIONS_[key][0])

        scraper = DuckDuckGoImageScraper()
        results = scraper.search_scrape_images(max_images=1, **kwargs)

        i = 0
        while i < len(results):
            try:
                image, mask = self.load_image(results[i]["download_path"])
                break
            except Exception as e:
                # some will fail
                i += 1

        # Convert Path to str
        for result in results:
            result["download_path"] = str(result["download_path"])

        return {"ui": {"text": json.dumps(results[0])}, "result": (image, mask)}

    def load_image(self, img: Union[Path, str]) -> Tuple[torch.Tensor, torch.Tensor]:
        """This code is taken from the LoadImage node code in ComfyUI. Maybe it's better to call that function directly?"""
        img = Image.open(img)

        # If the image has exif data, rotate it to the correct orientation and remove the exif data.
        img_raw = ImageOps.exif_transpose(img)

        # If in 32-bit mode, normalize the image appropriately.
        if img_raw.mode == "I":
            img_raw = img.point(lambda i: i * (1 / 255))

        # If image is rgba, create mask.
        if "A" in img_raw.getbands():
            mask = np.array(img_raw.getchannel("A")).astype(np.float32) / 255.0
            mask = 1.0 - torch.from_numpy(mask)
        else:
            # otherwise create a blank mask.
            mask = torch.zeros(
                (img_raw.height, img_raw.width), dtype=torch.float32, device="cpu"
            )
        mask = mask.unsqueeze(0)  # Add a batch dimension to mask

        # Convert the image to RGB.
        rgb_image = img_raw.convert("RGB")
        # Normalize the image's rgb values to {x | x ∈ float32, 0 <= x <= 1}
        rgb_image = np.array(rgb_image).astype(np.float32) / 255.0
        # Convert the image to a tensor (torch.from_numpy gives a tensor with the format of [H, W, C])
        rgb_image = torch.from_numpy(rgb_image)[
            None,
        ]  # Add a batch dimension, new format is [B, H, W, C]

        return rgb_image, mask
