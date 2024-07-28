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
import { app } from "../../scripts/app.js";
import { nodeConfig } from "./config.js";
import { appendGETresponse } from "./display-response-widget.js";
import { addMainContainer } from "./widgets-container.js";
const GoogleSearchExtension = {
  name: nodeConfig.graphName,
  beforeRegisterNodeDef: (nodeType, nodeData, app) =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (
        (nodeData === null || nodeData === void 0 ? void 0 : nodeData.name) ==
        nodeConfig.nodeBackendName
      ) {
        const constructorPrototype = nodeType.prototype;
        const liteGraph = app.graph;
        constructorPrototype.onNodeCreated = function () {
          const node = this;
          if (node.title == nodeConfig.nodeTitle) {
            addMainContainer(node);
          }
        };
        // Add a new widget to display the stdout/stderr after execution.
        constructorPrototype.onExecuted = function (data) {
          const node = this;
          if (node.widgets) {
            appendGETresponse(node, liteGraph, data).catch((err) => {
              console.error(
                "[onExecuted handler] Error appending GET response widget:",
                err
              );
            });
          }
        };
      }
    }),
};
app.registerExtension(GoogleSearchExtension);
