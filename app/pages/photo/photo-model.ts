import { Observable } from "data/observable";

export class PhotoModel extends Observable {
    public chosenPhotoPath = "";
    public chosenBackgroundPath = "";

    constructor() {
        super();
    }
}
