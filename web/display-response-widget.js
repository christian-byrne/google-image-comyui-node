var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { api } from "../../scripts/api.js";
import { nodeConfig } from "./config.js";
const JSON_PRE_STYLE = `color: var(--input-text); font-family: monospace; overflow: hidden; padding: 0px; margin: 0; background-color: var(--comfy-input-bg); border-radius: 4px; border: 1px solid var(--border-color); height: -webkit-fill-available; width: 100%`;
function getResponsePadding() {
  return (
    0.08 *
      (window === null || window === void 0 ? void 0 : window.innerHeight) || 12
  );
}
function addStyleElement() {
  const cssString = `#${nodeConfig.mainContainerId}::-webkit-scrollbar-track, #${nodeConfig.getResponseId}::-webkit-scrollbar-track
    {
      -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0.3);
      background-color: #F5F5F5;
    }
    #${nodeConfig.mainContainerId}::-webkit-scrollbar, #${nodeConfig.getResponseId}::-webkit-scrollbar
    {
      width: 4px;
      height: 4px;
      background-color: #F5F5F5;
    }
    #${nodeConfig.mainContainerId}::-webkit-scrollbar-thumb, #${nodeConfig.getResponseId}::-webkit-scrollbar-thumb
    {
      background-color: #000000;
      border: 1px solid #555555;
    }
  `;
  const style = Object.assign(document.createElement("style"), {
    innerText: cssString,
  });
  document.head.appendChild(style);
}
export function appendGETresponse(node, liteGraph, data) {
  return __awaiter(this, void 0, void 0, function* () {
    // Check if GET response is already appended
    let getResponseEl = document.querySelector(`#${nodeConfig.getResponseId}`);
    if (getResponseEl) {
      getResponseEl.innerText = JSON.stringify(
        JSON.parse(data.text.join("")),
        null,
        4
      );
      return;
    }
    addStyleElement();
    getResponseEl = Object.assign(document.createElement("pre"), {
      id: nodeConfig.getResponseId,
      style: JSON_PRE_STYLE,
      innerText: JSON.stringify(JSON.parse(data.text.join("")), null, 4),
    });
    let currentSize;
    let computedHeight;
    requestAnimationFrame(() => {
      const mainContainer = document.querySelector(
        `#${nodeConfig.mainContainerId}`
      );
      computedHeight = parseFloat(
        window.getComputedStyle(mainContainer).height
      );
      currentSize = node.computeSize();
      node.size[1] = Math.ceil(
        currentSize[1] + computedHeight + getResponsePadding()
      );
      mainContainer.appendChild(getResponseEl);
      liteGraph.setDirtyCanvas(true, true);
    });
  });
}
