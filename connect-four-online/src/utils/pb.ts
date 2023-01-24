import PocketBase from "pocketbase";

export default function createPB() {
    return new PocketBase("http://127.0.0.1:8090");
}