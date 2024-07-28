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
export function addMainContainer(node) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = Object.assign(document.createElement("div"), {
            id: nodeConfig.mainContainerId,
            style: `color: var(--input-text); font-family: monospace; overflow: auto; padding: 0px; margin: 0; background-color: var(--comfy-input-bg); border-radius: 4px; border: 1px solid var(--border-color);height: -webkit-fill-available; width: 0`,
        });
        if (node.addDOMWidget !== undefined) {
            node.addDOMWidget(nodeConfig.mainContainerId, "customtext", container, {
                getValue: () => "",
                height: 150,
                width: 100,
            });
        }
    });
}
