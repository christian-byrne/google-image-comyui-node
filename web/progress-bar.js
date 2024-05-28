var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { nodeConfig } from "./config.js";
export function removeProgressBar(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const mainConter = document.querySelector(`#${nodeConfig.mainContainerId}`);
        if (mainConter === null || mainConter === void 0 ? void 0 : mainConter.querySelector(`#${nodeConfig.progressBarId}`)) {
            mainConter.querySelector(`#${nodeConfig.progressBarId}`).remove();
            graph.setDirtyCanvas(true, false);
        }
    });
}
export function addProgressBar(graph) {
    return __awaiter(this, void 0, void 0, function* () {
        const mainConter = document.querySelector(`#${nodeConfig.mainContainerId}`);
        if (mainConter.querySelector(`#${nodeConfig.progressBarId}`)) {
            return;
        }
        const progressBarContainerEl = Object.assign(document.createElement("div"), {
            id: nodeConfig.progressBarId,
            className: "progress-bar-container",
            style: "height: 6px; display: flex; justify-content: center; align-items: center; z-index: 1000;",
        });
        const progressBarEl = Object.assign(document.createElement("div"), {
            id: "p2",
            className: "mdl-progress mdl-js-progress mdl-progress__indeterminate",
        });
        progressBarContainerEl.prepend(progressBarEl);
        mainConter.prepend(progressBarContainerEl);
        componentHandler.upgradeElement(progressBarEl);
        graph.setDirtyCanvas(true, false);
    });
}
