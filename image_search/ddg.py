from pathlib import Path

from duckduckgo_search import DDGS
from fastdownload import download_url
from fastcore.all import L

from typing import List
import folder_paths


class DuckDuckGoImageScraper:
    def __init__(
        self,
        downloads_dirname: str = "image_downloads",
        timout: int = 16,
    ):
        self.dl_path = Path(folder_paths.get_input_directory()) / downloads_dirname
        self.timeout = timout

    def get_dl_path(self) -> Path:
        return self.dl_path

    def search_images(
        self,
        **kwargs,
    ) -> List[dict]:
        fkey = lambda key: (
            kwargs.get(key, None) if kwargs.get(key, None) != "any" else None
        )

        with DDGS() as ddg:
            results = ddg.images(
                kwargs["search_phrase"],
                safesearch=fkey("safesearch"),
                size=fkey("size"),
                layout=fkey("layout"),
                license_image=fkey("license_image"),
                color=fkey("color"),
                timelimit=fkey("time_period"),
                type_image=fkey("type_image"),
                region=fkey("region"),
                max_results=kwargs.get("max_results", 3),
            )
            truncated = results[: kwargs.get("max_results", 3)]
            return L(truncated)

    def search_scrape_images(
        self,
        **kwargs,
    ) -> List[dict]:
        image_results = self.search_images(**kwargs)

        for index, result in enumerate(image_results):
            filename = (
                f"{kwargs.get('search_phrase')}_{index}{Path(result['image']).suffix}"
            )
            photo_dl_path = self.dl_path / filename
            try:
                download_url(
                    result["image"],
                    photo_dl_path,
                    timeout=self.timeout,
                    show_progress=False,
                )
            except Exception as e:
                print(
                    f"Failed to download image {index + 1} of {len(image_results)}\nError: {e}"
                )
                continue

            result["download_path"] = photo_dl_path

        return image_results
