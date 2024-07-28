import torch
import json
import numpy as np
from pathlib import Path
from PIL import Image, ImageOps
import random

from .image_search.ddg import DuckDuckGoImageScraper

from typing import Union, Tuple


class ImageSearchNode:
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
    CATEGORY = "data"

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
                # it is expected that some will fail
                i += 1

        for result in results:
            result["download_path"] = str(result["download_path"])

        return {"ui": {"text": json.dumps(results[0])}, "result": (image, mask)}

    def load_image(self, img: Union[Path, str]) -> Tuple[torch.Tensor, torch.Tensor]:
        """This function was taken from comfyanonymous/ComfyUI

        Repository: https://github.com/comfyanonymous/ComfyUI
        License: GPL-3.0 License
        Original file: nodes.py#L1473
        Commit: 6225a78

        """
        img = Image.open(img)

        img_raw = ImageOps.exif_transpose(img)

        if img_raw.mode == "I":
            img_raw = img.point(lambda i: i * (1 / 255))

        if "A" in img_raw.getbands():
            mask = np.array(img_raw.getchannel("A")).astype(np.float32) / 255.0
            mask = 1.0 - torch.from_numpy(mask)
        else:
            mask = torch.zeros(
                (img_raw.height, img_raw.width), dtype=torch.float32, device="cpu"
            )
        mask = mask.unsqueeze(0)

        rgb_image = img_raw.convert("RGB")
        rgb_image = np.array(rgb_image).astype(np.float32) / 255.0
        rgb_image = torch.from_numpy(rgb_image)[None,]

        return rgb_image, mask
