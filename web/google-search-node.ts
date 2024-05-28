import { app } from "@comfy-main-web/scripts/app.js";
import {
  ComfyExtension,
  ComfyObjectInfo,
} from "@comfy-main-web/types/comfy.js";
import { LGraph } from "@comfy-main-web/types/litegraph.js";
import { ComfyApp, NodeType, LGraphNodeExtension } from "./types/comfy-app.js";
import { nodeConfig } from "./config.js";
import { appendGETresponse } from "./display-response-widget.js";
import { addProgressBar, removeProgressBar } from "./progress-bar.js";
import { addMainContainer } from "./widgets-container.js";

const GoogleSearchExtension: ComfyExtension = {
  name: nodeConfig.graphName,
  init: async (app: ComfyApp) => {
    document.head.append(
      Object.assign(document.createElement("script"), {
        src: "https://code.getmdl.io/1.3.0/material.min.js",
      })
    );
    // TODO: Remove on node remove
    document.head.append(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: "https://code.getmdl.io/1.3.0/material.teal-deep_purple.min.css",
      })
    );
    document.head.append(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/icon?family=Material+Icons",
      })
    );
  },
  setup: async (app: ComfyApp) => {
    // const nodeActive = app.graph.findNodeByTitle(nodeConfig.nodeTitle);
  },
  getCustomWidgets: async (app: ComfyApp) => {
    return {};
  },
  loadedGraphNode: async (node: LGraphNodeExtension, app: ComfyApp) => {},
  nodeCreated: async (node: LGraphNodeExtension, app: ComfyApp) => {},
  addCustomNodeDefs: async (
    defs: Record<string, ComfyObjectInfo>,
    app: ComfyApp
  ) => {},
  registerCustomNodes: async (app: ComfyApp) => {},
  beforeRegisterNodeDef: async (
    nodeType: NodeType,
    nodeData: ComfyObjectInfo,
    app: ComfyApp
  ) => {
    if (nodeData?.name == nodeConfig.nodeBackendName) {
      const constructorPrototype = nodeType.prototype; 
      const liteGraph: LGraph = app.graph;

      constructorPrototype.onNodeCreated = function () {
        const node: LGraphNodeExtension = this;
        if (node.title == nodeConfig.nodeTitle) {
          addMainContainer(node);
        }
      };

      const curExecutionStart = constructorPrototype.onExecutionStart;
      constructorPrototype.onExecutionStart = function () {
        const node: LGraphNodeExtension = this;
        addProgressBar(liteGraph);
        if (curExecutionStart) {
          curExecutionStart.call(node);
        }
      };

      constructorPrototype.onExecuted = function (data) {
        const node: LGraphNodeExtension = this;
        if (node.widgets) {
          removeProgressBar(liteGraph).then(() => {
            appendGETresponse(node, liteGraph, data).catch((err) => {
              console.error(
                "[onExecuted handler] Error appending GET response widget:",
                err
              );
            });
          });
        }
      };
    }
  },
};

app.registerExtension(GoogleSearchExtension);
