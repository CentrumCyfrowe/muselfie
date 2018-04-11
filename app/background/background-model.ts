import { Observable } from "data/observable";
import { FileSystemEntity } from "tns-core-modules/file-system";

export class BackgroundModel extends Observable {
    public chosenImagePath = "";

    constructor() {
        super();
    }

    public imageChosen(image: FileSystemEntity) {
        this.set("chosenImagePath", image.path);
    }
}
