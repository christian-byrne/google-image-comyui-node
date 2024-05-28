import { LGraph } from "@comfy-main-web/types/litegraph.js";
import { nodeConfig } from "./config.js";

declare var componentHandler: any;

export async function removeProgressBar(graph: LGraph) {
  const mainConter: HTMLElement = document.querySelector(
    `#${nodeConfig.mainContainerId}`
  );
  if (mainConter?.querySelector(`#${nodeConfig.progressBarId}`)) {
    mainConter.querySelector(`#${nodeConfig.progressBarId}`).remove();
    graph.setDirtyCanvas(true, false);
  }
}

export async function addProgressBar(graph: LGraph) {
  const mainConter: HTMLElement = document.querySelector(
    `#${nodeConfig.mainContainerId}`
  );
  if (mainConter.querySelector(`#${nodeConfig.progressBarId}`)) {
    return;
  }

  const progressBarContainerEl = Object.assign(document.createElement("div"), {
    id: nodeConfig.progressBarId,
    className: "progress-bar-container",
    style:
      "height: 6px; display: flex; justify-content: center; align-items: center; z-index: 1000;",
  });
  const progressBarEl = Object.assign(document.createElement("div"), {
    id: "p2",
    className: "mdl-progress mdl-js-progress mdl-progress__indeterminate",
  });
  progressBarContainerEl.prepend(progressBarEl);
  mainConter.prepend(progressBarContainerEl);
  componentHandler.upgradeElement(progressBarEl);
  graph.setDirtyCanvas(true, false);
}
