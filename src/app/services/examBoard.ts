import {EXAM_BOARD} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import { user } from "../state/reducers";

export const determineExamBoardFrom = (userPreferences: UserPreferencesDTO | null) => {
    if (userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA) {
        return EXAM_BOARD.AQA;
    } else {
        return EXAM_BOARD.OCR;
    }
};
