import * as ApiTypes from "./IsaacApiTypes";
import {ACTION_TYPES, EXAM_BOARDS} from "./app/services/constants";
import {ContentDTO} from "./IsaacApiTypes";

export type Action =
    | {type: ACTION_TYPES.TEST_ACTION}

    | {type: ACTION_TYPES.USER_UPDATE_REQUEST}
    | {type: ACTION_TYPES.USER_UPDATE_FAILURE}

    | {type: ACTION_TYPES.USER_LOG_IN_REQUEST}
    | {type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS; user: ApiTypes.RegisteredUserDTO}
    | {type: ACTION_TYPES.USER_LOG_IN_FAILURE; errorMessage: string}
    | {type: ACTION_TYPES.USER_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPES.USER_PASSWORD_RESET_REQUEST_SUCCESS}
    | {type: ACTION_TYPES.USER_LOG_OUT_REQUEST}
    | {type: ACTION_TYPES.USER_LOG_OUT_RESPONSE_SUCCESS}
    | {type: ACTION_TYPES.AUTHENTICATION_REQUEST_REDIRECT; provider: string}
    | {type: ACTION_TYPES.AUTHENTICATION_REDIRECT; provider: string; redirectUrl: string}
    | {type: ACTION_TYPES.AUTHENTICATION_HANDLE_CALLBACK}

    | {type: ACTION_TYPES.DOCUMENT_REQUEST; questionId: string}
    | {type: ACTION_TYPES.DOCUMENT_RESPONSE_SUCCESS; doc: ApiTypes.ContentDTO}
    | {type: ACTION_TYPES.DOCUMENT_RESPONSE_FAILURE}

    | {type: ACTION_TYPES.QUESTION_REGISTRATION; question: ApiTypes.QuestionDTO}
    | {type: ACTION_TYPES.QUESTION_DEREGISTRATION; questionId: string}
    | {type: ACTION_TYPES.QUESTION_ATTEMPT_REQUEST; questionId: string; attempt: ApiTypes.ChoiceDTO}
    | {type: ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_SUCCESS; questionId: string; response: ApiTypes.QuestionValidationResponseDTO}
    | {type: ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_FAILURE}
    | {type: ACTION_TYPES.QUESTION_SET_CURRENT_ATTEMPT; questionId: string; attempt: ApiTypes.ChoiceDTO}

    | {type: ACTION_TYPES.TOPIC_REQUEST; topicName: string}
    | {type: ACTION_TYPES.TOPIC_RESPONSE_SUCCESS; topic: TopicDTO}

    | {type: ACTION_TYPES.GAMEBOARD_REQUEST; gameboardId: string | null}
    | {type: ACTION_TYPES.GAMEBOARD_RESPONSE_SUCCESS; gameboard: ApiTypes.GameboardDTO}

    | {type: ACTION_TYPES.ASSIGNMENTS_REQUEST}
    | {type: ACTION_TYPES.ASSIGNMENTS_RESPONSE_SUCCESS; assignments: ApiTypes.AssignmentDTO[]};

export interface AppQuestionDTO extends ApiTypes.QuestionDTO {
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
}

export interface TopicLinkDTO {
    comingSoon?: boolean;
    onlyFor?: EXAM_BOARDS[];
    destination: string;
}

export interface AllTopicsDTO {
    [category: string]: {
        [subCategory: string]: {
            [topicHeading: string]: TopicLinkDTO;
        };
    };
}

export enum LinkType {CONTENT = "contents", QUESTION = "questions"}

export interface ContentLinkDTO {
    value: string;
    destination: string | {[examBoard in EXAM_BOARDS]: string};
    type: LinkType;
    comingSoon?: boolean;
}

export interface TopicDTO {
    title: string;
    description: ContentDTO;
    contentLinks: ContentLinkDTO[];
}
