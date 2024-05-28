var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { app } from "../../scripts/app.js";
import { nodeConfig } from "./config.js";
import { appendGETresponse } from "./display-response-widget.js";
import { addProgressBar, removeProgressBar } from "./progress-bar.js";
import { addMainContainer } from "./widgets-container.js";
const GoogleSearchExtension = {
    name: nodeConfig.graphName,
    init: (app) => __awaiter(void 0, void 0, void 0, function* () {
        document.head.append(Object.assign(document.createElement("script"), {
            src: "https://code.getmdl.io/1.3.0/material.min.js",
        }));
        // TODO: Remove on node remove
        document.head.append(Object.assign(document.createElement("link"), {
            rel: "stylesheet",
            href: "https://code.getmdl.io/1.3.0/material.teal-deep_purple.min.css",
        }));
        document.head.append(Object.assign(document.createElement("link"), {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/icon?family=Material+Icons",
        }));
    }),
    setup: (app) => __awaiter(void 0, void 0, void 0, function* () {
        // const nodeActive = app.graph.findNodeByTitle(nodeConfig.nodeTitle);
    }),
    getCustomWidgets: (app) => __awaiter(void 0, void 0, void 0, function* () {
        return {};
    }),
    loadedGraphNode: (node, app) => __awaiter(void 0, void 0, void 0, function* () { }),
    nodeCreated: (node, app) => __awaiter(void 0, void 0, void 0, function* () { }),
    addCustomNodeDefs: (defs, app) => __awaiter(void 0, void 0, void 0, function* () { }),
    registerCustomNodes: (app) => __awaiter(void 0, void 0, void 0, function* () { }),
    beforeRegisterNodeDef: (nodeType, nodeData, app) => __awaiter(void 0, void 0, void 0, function* () {
        if ((nodeData === null || nodeData === void 0 ? void 0 : nodeData.name) == nodeConfig.nodeBackendName) {
            const constructorPrototype = nodeType.prototype; // See: https://www.typescriptlang.org/play/?#code/FDDGBsEMGdoAgDIHEBOkAOALAcgewCYCmcA3nMHJXAPTVwAiuh0AdgOQAucmkAbsbhYBRAB6FQAVw6F8cABSQWs3B0yEUcALaFVBaAEo4AIwCecIgDNIE8B2ABfEBYktQHAJaDjhC7hSEAJUIAc3doaRQ8InofORYCQgAVE3RCAC44DhTCXAtEVAwcBMMSCipaOAADLNTc-LQsKMJKuH8LdXgOXEy1esKmuFBBcJQJNz8AOjhEni5QRW84fhR3C3cZb3mJaEIyyhZCAHc4eKJk1Ll9AG4aOjkARkMTXAlBhe3iA+Ovdy4uwf8kGkcAW7hY4UUoF2VEGw1w4EIE3AuGCcgAhGjTklshN0CgVCpsoYKnIAEyGX7cGAguB4gk1Yh01IoLJ7cgwipY86IuldBlwMI9Rn4vnZOB1VTEZANIpEWHgjijcYoNkIubDRVjLooAAKIsJqTgAF44AB5IwAK3EHAmwR0evp2VNFjiCW5+jZQ3B8MRyNRXpGWr8DtFqQ9MIDPqRKLkAc1ypDBuIYIhrhyeQAYi43J4WOGqJ64Qjo6jzVa3BMwqJpOD3EYEbGNUrtYmGfpiXQAMJNoMaXlJt4sRaEEQ1oiyQ6-TAnI60-HoaBstkVGbC3ALkH+ODQHj+WSQUD42Ag8DgAUKyHMAGEIEbUw9IHy8K91U6VrG+SGI0APlIkeLfpyAARCO4hSDIQH6I4MJcji-YMhMgiiGB0iyCaKA3CuADKcCTqePT4sc6j4hoLgIseI5jn0jQJCAMJqjOhwAJIXmmH5fNRsqEJcVxsl8LGplCiHCGIkioZcDggMARg+H4gQhGEERNDELrSv0xTAEAA
            const liteGraph = app.graph;
            // Create ace-editor DOM elements and listeners.
            constructorPrototype.onNodeCreated = function () {
                const node = this;
                if (node.title == nodeConfig.nodeTitle) {
                    addMainContainer(node);
                }
            };
            const curExecutionStart = constructorPrototype.onExecutionStart;
            constructorPrototype.onExecutionStart = function () {
                const node = this;
                addProgressBar(liteGraph);
                if (curExecutionStart) {
                    curExecutionStart.call(node);
                }
            };
            // Add a new widget to display the stdout/stderr after execution.
            constructorPrototype.onExecuted = function (data) {
                const node = this;
                if (node.widgets) {
                    removeProgressBar(liteGraph).then(() => {
                        appendGETresponse(node, liteGraph, data).catch((err) => {
                            console.error("[onExecuted handler] Error appending GET response widget:", err);
                        });
                    });
                }
            };
        }
    }),
};
app.registerExtension(GoogleSearchExtension);
