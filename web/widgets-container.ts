import { LGraphNodeExtension } from "./types/comfy-app.js";
import { nodeConfig } from "./config.js";

export async function addMainContainer(node: LGraphNodeExtension) {
  const container = Object.assign(document.createElement("div"), {
    id: nodeConfig.mainContainerId,
    style: `color: var(--input-text); font-family: monospace; overflow: auto; padding: 0px; margin: 0; background-color: var(--comfy-input-bg); border-radius: 4px; border: 1px solid var(--border-color);height: -webkit-fill-available; width: 0`,
  });
  if (node.addDOMWidget !== undefined) {
    node.addDOMWidget(nodeConfig.mainContainerId, "customtext", container, {
      getValue: () => "",
      height: 50,
      width: 100,
    });
  }
}
