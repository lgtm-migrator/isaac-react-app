import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    getProgress
} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {ProgressBar} from "../elements/ProgressBar";
import {Tabs} from "../elements/Tabs";
import {QuestionProgressGraphs} from "../elements/QuestionProgressGraphs";
import {DailyStreakGauge} from "../elements/DailyStreakGauge";
import {HUMAN_QUESTION_TYPES, QUESTION_TYPES} from "../../services/questions";
import {ActivityGraph} from "../elements/ActivityGraph";
import {Assignments} from "../elements/Assignments";
import {filterAssignmentsByStatus} from "../../services/assignments";
import {isTeacher} from "../../services/user";
import {TeacherAchievement} from "../elements/TeacherAchievement";
import {IS_CS_PLATFORM} from "../../services/constants";



export const MyProgress = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userProgress = useSelector((state: AppState) => state && state.userProgress);
    const myAssignments = useSelector((state: AppState) => state && state.assignments || null);
    const achievementsSelector = useSelector((state: AppState) => state && state.userProgress && state.userProgress.userSnapshot && state.userProgress.userSnapshot.achievementsRecord);

    useEffect(() => {
        if (!userProgress) {
            dispatch(getProgress());
        }
    }, [userProgress]);

    // useEffect(() => {
    //     if (!myAssignments) {
    //         dispatch(loadMyAssignments());
    //     }
    // }, [myAssignments]);

    const safePercentage = (correct: number | null | undefined, attempts: number | null | undefined) => (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;

    const fullCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const fullAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const partCorrect = userProgress && userProgress.totalQuestionsCorrect;
    const partAttempt = userProgress && userProgress.totalQuestionsAttempted;
    const fullPercentage = safePercentage(fullCorrect, fullAttempt);
    const partPercentage = safePercentage(partCorrect, partAttempt);


    return <RS.Container id="my-progress">
        <TitleAndBreadcrumb currentPageTitle="My Progress"/>
        <RS.Card className="p-3 mt-4">
            <RS.CardTitle tag="h2">
                Question statistics
            </RS.CardTitle>
            <RS.CardBody>
                <RS.Row>
                    <RS.Col className={"col-md-8 pr-5 mt-2"}>
                        <RS.Row>
                            Questions completed correctly of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={fullPercentage || 0} description={fullPercentage == null ? "No data" : `${fullCorrect} of ${fullAttempt}`}/>
                        </RS.Row>
                        <RS.Row className={"mt-3"}>
                            Question parts correct of those attempted
                        </RS.Row>
                        <RS.Row className={"mt-2"}>
                            <ProgressBar percentage={partPercentage || 0} description={partPercentage == null ? "No data" : `${partCorrect} of ${partAttempt}`}/>
                        </RS.Row>
                    </RS.Col>
                    <RS.Col className={"col-md-4"}>
                        <RS.Row>
                            <div className={"text-center-width"}>
                                Daily streak
                            </div>
                        </RS.Row>
                        <RS.Row>
                            <DailyStreakGauge streakRecord={userProgress && userProgress.userSnapshot && userProgress.userSnapshot.streakRecord}/>
                        </RS.Row>
                        <RS.Row>
                            <div id="streak-help" className={"text-center-width"}>
                                Longest streak: {userProgress && userProgress.userSnapshot && userProgress.userSnapshot.streakRecord && userProgress.userSnapshot.streakRecord.largestStreak} days
                            </div>
                            <RS.UncontrolledTooltip placement="bottom" target="streak-help">
                                <div  className="text-left">
                                    The daily streak indicates the number of consecutive days you have been active on Isaac.<br/>
                                    Answer at least <b>three question parts</b> correctly per day to fill up your daily progress bar and increase your streak!
                                </div>
                            </RS.UncontrolledTooltip>
                        </RS.Row>
                    </RS.Col>
                </RS.Row>
                <Tabs className={"my-3"}>
                    {{
                        "Correct Questions": <QuestionProgressGraphs subId="correct" questionsByTag={(userProgress && userProgress.correctByTag) || {}} questionsByLevel={(userProgress && userProgress.correctByLevel) || {}}/>,
                        "Attempted Questions": <QuestionProgressGraphs subId="attempted" questionsByTag={(userProgress && userProgress.attemptsByTag) || {}} questionsByLevel={(userProgress && userProgress.attemptsByLevel) || {}}/>
                    }}
                </Tabs>

                <RS.Row className={"mt-3"}>
                    <h4>
                        Question parts correct by Type
                    </h4>
                </RS.Row>
                <RS.Row>
                    {(Array.from(QUESTION_TYPES.keys()) as string[]).filter((qType: string) => qType != "default").map((qType: string) => {
                        const correct = userProgress && userProgress.correctByType && userProgress.correctByType[qType] || null;
                        const attempts = userProgress && userProgress.attemptsByType && userProgress.attemptsByType[qType] || null;
                        const percentage = safePercentage(correct, attempts);
                        return <RS.Col key={qType} className={"col-lg-4 mt-2 type-progress-bar"}>
                            <RS.Row className={"px-2"}>
                                {HUMAN_QUESTION_TYPES.get(qType)} questions correct
                            </RS.Row>
                            <RS.Row className={"px-2"}>
                                <ProgressBar percentage={percentage || 0} description={percentage == null ? "No data" : `${correct} of ${attempts}`}/>
                            </RS.Row>
                        </RS.Col>
                    })}
                </RS.Row>
                <RS.Row className={"mt-3"}>
                    <h4>
                        Question attempts over time
                    </h4>
                </RS.Row>
                <RS.Row>
                    <ActivityGraph/>
                </RS.Row>
            </RS.CardBody>
        </RS.Card>
        {isTeacher(user) &&
            <RS.Card className="p-3 mt-3">
                <RS.CardTitle tag="h2">
                    Isaac teacher activity
                </RS.CardTitle>
                <RS.CardBody>
                    <TeacherAchievement
                        verb="created"
                        count={achievementsSelector && achievementsSelector.TEACHER_GROUPS_CREATED}
                        item="group"
                        createMoreText="Manage groups"
                        createMoreLink="/groups"
                        iconClassName="group-badge"/>

                    <TeacherAchievement
                        verb="set"
                        count={achievementsSelector && achievementsSelector.TEACHER_ASSIGNMENTS_SET}
                        item="assignment"
                        createMoreText="Set assignments"
                        createMoreLink="/set_assignments"
                        iconClassName="assignment-badge"/>

                    <TeacherAchievement
                        verb="created"
                        count={achievementsSelector && achievementsSelector.TEACHER_GAMEBOARDS_CREATED}
                        item="gameboard"
                        createMoreText="Board builder"
                        createMoreLink="/gameboard_builder"
                        iconClassName="gameboard-badge"/>

                    {!IS_CS_PLATFORM && <TeacherAchievement
                        verb="set"
                        count={achievementsSelector && achievementsSelector.TEACHER_BOOK_PAGES_SET}
                        item="book page assignment"
                        createMoreText="Set assignments"
                        createMoreLink="/set_assignments"
                        iconClassName="book-page-badge"/>
                    }

                    <TeacherAchievement
                        verb="visited"
                        count={achievementsSelector && achievementsSelector.TEACHER_CPD_EVENTS_ATTENDED}
                        item="CPD event"
                        createMoreText="Events"
                        createMoreLink="/events"
                        iconClassName="cpd-badge"/>
                </RS.CardBody>
            </RS.Card>
        }
        <RS.Card className="p-3 mt-3 mb-5">
            <RS.CardTitle tag="h2">
                Current assignments
            </RS.CardTitle>
            <RS.CardBody>
                <Assignments assignments={filterAssignmentsByStatus(myAssignments).inProgressRecent}/>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>
};