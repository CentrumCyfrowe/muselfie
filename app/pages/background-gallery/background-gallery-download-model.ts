import { Observable } from "data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { layout } from "tns-core-modules/utils/utils";
import * as fs from "tns-core-modules/file-system";
import * as http from "http";

import { BackgroundEntry, backgroundEntryType } from "./background-gallery-model";

/**
 * This interface mirrors the way backgrounds are return by the REST API
 */
export interface RemoteBackgroundEntry {
    id: number;
    name: string;
    image_url: string;
    thumbnail_url: string;
}

export class BackgroundDownloadModel extends Observable {
    public static API_URL = "https://muselfie-backend.test.laboratorium.ee";
    public remoteBackgrounds = new ObservableArray<RemoteBackgroundEntry>();
    public thumbnailHeight = 250;
    public imageSize;
    public chosenRemoteBackground: RemoteBackgroundEntry;
    public busy = true; // show the loading indicator

    constructor() {
        super();
    }

    public downloadImageList(width: number, height: number) {
        let widthPx = layout.toDevicePixels(width);
        let heightPx = layout.toDevicePixels(height);
        return http.getJSON(
            `${BackgroundDownloadModel.API_URL}/api/backgrounds/?required_height=${heightPx}&required_width=${widthPx}`,
        ).then((apiBackgrounds: RemoteBackgroundEntry) => {
            if (!(apiBackgrounds instanceof Array)) {
                // Wrong format. Reject.
                return Promise.reject("Wrong format of JSON response.");
            }

            // Make the urls absolute
            apiBackgrounds.forEach(background => {
                background.image_url = BackgroundDownloadModel.API_URL + background.image_url;
                background.thumbnail_url = BackgroundDownloadModel.API_URL + background.thumbnail_url;
            });

            this.remoteBackgrounds.push(apiBackgrounds);
            this.set("busy", false); // hide the loading indicator
        });
    }

    public downloadChosenBackground(): Promise<BackgroundEntry> {
        this.set("busy", true);
        const remoteBackgroundsFolder = fs.knownFolders.documents().getFolder("backgrounds");
        const filePath = fs.path.join(remoteBackgroundsFolder.path, `${this.chosenRemoteBackground.id}.jpg`);
        const thumbPath = fs.path.join(remoteBackgroundsFolder.path, `${this.chosenRemoteBackground.id}_thumb.jpg`);
        return http.getFile(this.chosenRemoteBackground.image_url, filePath).then(() => {
            return http.getFile(this.chosenRemoteBackground.image_url, thumbPath).then(() => {
                this.set("busy", false);
                return {
                    path: filePath,
                    thumbnailPath: thumbPath,
                    name: this.chosenRemoteBackground.name,
                    type: "external" as backgroundEntryType,
                    remoteId: this.chosenRemoteBackground.id,
                };
            });
        });
    }
}