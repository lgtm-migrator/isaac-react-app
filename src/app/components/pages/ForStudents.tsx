import React from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Link} from "react-router-dom";
import {LinkCard} from "../elements/LinkCard";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null
});

interface ForStudentProps {
    user: LoggedInUser | null;
}

const ForStudentsComponent = ({user}: ForStudentProps) => {
    const pageTitle = user && user.loggedIn ? "My Isaac" : "How we help students";
    const registrationButton = <div className="text-center">
        <RS.Button size="lg" tag={Link} to={"/register"} color="primary" outline>Sign up</RS.Button>
    </div>;

    return <RS.Container className="students-page">
        <RS.Row className="pb-4">
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="Students" />
            </RS.Col>
        </RS.Row>

        {!(user && user.loggedIn) && <RS.Row>
            <RS.Col md={{size: 8, offset: 2}} className="pb-4">
                <React.Fragment>
                    <PageFragment fragmentId="for_students_logged_out"/>
                    {registrationButton}
                </React.Fragment>
            </RS.Col>
        </RS.Row>}

        {user && user.loggedIn &&
        <RS.Row>
            <RS.Col>
                {user && user.loggedIn && <h2 className="h-secondary h-m">Pick up where you left off</h2>}
                <div className="pattern-07 pb-5">
                    <RS.Row>
                        <RS.ListGroup className="mt-md-4 mb-3 d-block d-md-flex flex-wrap flex-row link-list align-items-stretch">
                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Assignments" imageSource="/assets/card04.svg"
                                    linkDestination="/assignments" linkText="View your assignments"
                                >
                                    View the current status of your assignments.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Topics" imageSource="/assets/card01.svg"
                                    linkDestination="/topics" linkText="View all topics"
                                >
                                    Work through one of your course&apos;s topics.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Events" imageSource="/assets/card02.svg"
                                    linkDestination="/events" linkText="View our events"
                                >
                                    Attend one of our free student workshop events.
                                </LinkCard>
                            </RS.ListGroupItem>
                        </RS.ListGroup>
                    </RS.Row>
                </div>
            </RS.Col>
        </RS.Row>}
    </RS.Container>;
};

export const ForStudents = connect(stateToProps)(ForStudentsComponent);
