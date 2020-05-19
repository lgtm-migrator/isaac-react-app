import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Button, Container} from "reactstrap";
import {loadAssignmentsOwnedByMe, loadProgress, openActiveModal} from "../../state/actions";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {AssignmentDTO, GameboardDTO, GameboardItem} from "../../../IsaacApiTypes";
import {AppAssignmentProgress} from "../../../IsaacAppTypes";
import {API_PATH, ASSIGNMENT_PROGRESS_CRUMB} from "../../services/constants";
import {ShowLoading} from "../handlers/ShowLoading";
import {AssignmentProgressLegend, ProgressDetails} from "./AssignmentProgress";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";

interface PageSettings {
    colourBlind: boolean;
    setColourBlind: (newValue: boolean) => void;
    formatAsPercentage: boolean;
    setFormatAsPercentage: (newValue: boolean) => void;
}

type EnhancedGameboard = GameboardDTO & {
    questions: (GameboardItem & { questionPartsTotal: number })[];
};

type SingleEnhancedAssignment = AssignmentDTO & {
    gameboard: EnhancedGameboard;
};

interface SingleProgressDetailsProps {
    assignmentId: number;
    assignment: SingleEnhancedAssignment;
    progress: AppAssignmentProgress[];
    pageSettings: PageSettings;
}

function hasGameboard(assignment: AssignmentDTO): assignment is SingleEnhancedAssignment {
    return assignment.gameboard != undefined;
}

const SingleProgressDetails = (props: SingleProgressDetailsProps) => {
    const {assignmentId, assignment, progress, pageSettings} = props;
    const dispatch = useDispatch();

    function getCSVDownloadLink(assignmentId: number) {
        return API_PATH + "/assignments/assign/" + assignmentId + "/progress/download";
    }

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <AssignmentProgressLegend pageSettings={pageSettings}/>
        <div className="single-download mb-2">
            <Button className="d-none d-md-inline" color="link" tag="a" href={getCSVDownloadLink(assignmentId)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
        </div>
        <ProgressDetails pageSettings={pageSettings} assignment={assignment} progress={progress}/>
    </div>;
};

export const SingleAssignmentProgress = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const assignmentId = params.assignmentId;

    dispatch(loadProgress({_id: assignmentId}));
    dispatch(loadAssignmentsOwnedByMe());

    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);

    const myOwnedAssignments = useSelector((state: AppState) => {
        return state?.assignments
    });

    const assignmentProgress = useSelector((state: AppState) => {
        return state?.progress
    });

    const pageSettings = {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};


    const [assignment, setAssignment] = useState(myOwnedAssignments?.find(x => x._id == assignmentId));

    useEffect(() => {
        setAssignment(myOwnedAssignments?.find(x => x._id == assignmentId));
    }, [myOwnedAssignments, assignmentId]);

    return <Container id={`single-assignment-${assignmentId}`} className="mb-5">
        <ShowLoading until={assignment && assignmentProgress}>

            <TitleAndBreadcrumb intermediateCrumbs={[ASSIGNMENT_PROGRESS_CRUMB]}
                currentPageTitle={`${assignment?.gameboard?.title || "Single Assignment Progress" }`}
                className="mb-4" />

            {assignment && assignmentProgress && hasGameboard(assignment) &&
            <SingleProgressDetails assignmentId={assignmentId} assignment={assignment}
                progress={assignmentProgress[assignmentId]} pageSettings={pageSettings}/>
            }

        </ShowLoading>
    </Container>
};
