import { api } from "@comfy-main-web/scripts/api.js";
import { APIOutputRecord } from "./types/history.js";
import { LGraphNodeExtension } from "./types/comfy-app.js";
import { LGraph } from "@comfy-main-web/types/litegraph.js";
import { nodeConfig } from "./config.js";
import { APIWorkflow } from "./types/workflow.js";

const JSON_PRE_STYLE = `color: var(--input-text); font-family: monospace; overflow: hidden; padding: 0px; margin: 0; background-color: var(--comfy-input-bg); border-radius: 4px; border: 1px solid var(--border-color); height: -webkit-fill-available; width: 100%`;

function getResponsePadding() {
  return 0.08 * window?.innerHeight || 12;
}

function addStyleElement() {
  const cssString = `#${nodeConfig.mainContainerId}::-webkit-scrollbar-track, #${nodeConfig.getResponseId}::-webkit-scrollbar-track
    {
      -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0.3);
      background-color: #F5F5F5;
    }
    #${nodeConfig.mainContainerId}::-webkit-scrollbar, #${nodeConfig.getResponseId}::-webkit-scrollbar
    {
      width: 5px;
      height: 5px;
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

export async function appendGETresponse(
  node: LGraphNodeExtension,
  liteGraph: LGraph,
  data: APIOutputRecord
) {
  // Check if GET response text is already appended
  let getResponseEl: HTMLPreElement = document.querySelector(
    `#${nodeConfig.getResponseId}`
  );
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

  let currentSize: [number, number];
  let computedHeight: number;
  requestAnimationFrame(() => {
    const mainContainer: HTMLDivElement = document.querySelector(
      `#${nodeConfig.mainContainerId}`
    );
    computedHeight = parseFloat(window.getComputedStyle(mainContainer).height);
    currentSize = node.computeSize();
    node.size[1] = Math.ceil(
      currentSize[1] + computedHeight + getResponsePadding()
    );
    liteGraph.setDirtyCanvas(true, false);
    mainContainer.appendChild(getResponseEl);

    // Fill available on resize
    let startSize = node.size;
    const handleInitialResize = (graphChangeEvent) => {
      if (graphChangeEvent?.detail) {
        const graphState: APIWorkflow = graphChangeEvent.detail;
        const nodeState = graphState.nodes.find((n) => n.id === node.id);
        if (nodeState?.size !== startSize) {
          document
            .querySelector(`#${nodeConfig.getResponseId}`)
            .setAttribute(
              "style",
              "height: -webkit-fill-available;" + JSON_PRE_STYLE
            );
          api.removeEventListener("graphChanged", handleInitialResize);
        }
      }
    };
    api.addEventListener("graphChanged", handleInitialResize);
  });
}
