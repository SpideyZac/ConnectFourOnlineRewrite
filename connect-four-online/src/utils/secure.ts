import ncrypt from "ncrypt-js";

import config from "@/config";

export function createNcrypt() {
    return new ncrypt(config.secure.key);
}