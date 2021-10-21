import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {AppState} from "../../state/reducers";
import {getEmailTemplate, sendAdminEmailWithIds, sendContentEmailWithIds} from "../../state/actions";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {debounce} from 'lodash';
import {isEventManager} from "../../services/user";
import {convert} from 'html-to-text';

interface ContentEmailsProps {
    location: {
        state?: {
            csvIDs?: number[];
        };
    };
}

const RECIPIENT_NUMBER_WARNING_VALUE = 2000;

export const ContentEmails = (props: ContentEmailsProps) => {
    const dispatch = useDispatch();
    const [csvIDs, setCSVIDs] = useState(props.location.state?.csvIDs || [] as number[]);
    const [emailType, setEmailType] = useState("null");
    const [emailSent, setEmailSent] = useState(false);
    const user = useSelector((state: AppState) => state?.user);
    const [emailSubject, setEmailSubject] = useState("");
    const [htmlTemplate, setHtmlTemplate] = useState("");
    const [plaintextTemplate, setPlaintextTemplate] = useState("");

    const numberOfUsers = csvIDs.length;
    const canSubmit = emailSubject.length != 0 && htmlTemplate.length != 0 && plaintextTemplate.length != 0 && emailType != "null" && numberOfUsers > 0;
    const csvInputDebounce = debounce((value: string) => setCSVIDs(value.split(/[\s,]+/).map((e) => {return parseInt(e)}).filter((num) => !isNaN(num))), 250);

    useEffect(() => {
        isEventManager(user) && setEmailType("EVENTS");
    }, [user]);

    useEffect(() => {
        setPlaintextTemplate(convert(htmlTemplate));
    }, [htmlTemplate]);

    return <RS.Container id="admin-emails-page">
        <TitleAndBreadcrumb currentPageTitle="Content email sending" />

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">User selection</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>Comma separated list of user IDs to email.</RS.Label>
                <RS.Input
                    id="email-user-ids-input"
                    type = "textarea"
                    defaultValue={csvIDs.join(", ")}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        csvInputDebounce(event.target.value);
                    }}
                />
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email subject</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>Email subject</RS.Label>
                <RS.Input
                    id="email-subject-input" type="text" value={emailSubject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailSubject(e.target.value);
                    }}
                >
                </RS.Input>
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email Template</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>Email HTML</RS.Label>
                <RS.Input
                    id="email-html-input"
                    type = "textarea"
                    defaultValue={htmlTemplate}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setHtmlTemplate(event.target.value);
                    }}
                    rows={10}
                />
            </RS.CardBody>
            <RS.CardBody>
                <RS.Label>Email Plaintext</RS.Label>
                <RS.Input
                    id="email-plaintext-input"
                    type = "textarea"
                    value={plaintextTemplate}
                    disabled={true}
                    rows={10}
                />
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="p-3 my-3">
            <RS.CardTitle tag="h2">Email type</RS.CardTitle>
            <RS.CardBody>
                <RS.Label>The type of email you are sending.</RS.Label>
                <p>Users who have opted out of this type of email will
                    not receive anything. Administrative emails cannot be opted out of and should be avoided.</p>
                <RS.Input
                    id="email-type-input" type="select" value={emailType}
                    disabled={isEventManager(user)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEmailType(e.target.value);
                    }}
                >
                    <option value="null">--- Make a selection ---</option>
                    <option value="ASSIGNMENTS">Assignments</option>
                    <option value="NEWS_AND_UPDATES">News and updates</option>
                    <option value="EVENTS">Events</option>
                    <option value="ADMIN">Urgent administrative email</option>
                </RS.Input>
            </RS.CardBody>
        </RS.Card>

        <RS.Card className="mb-5">
            <RS.CardBody>
                <div className="text-center">
                    {!emailSent ?
                        <React.Fragment>
                            {numberOfUsers >= RECIPIENT_NUMBER_WARNING_VALUE && <div className="alert alert-warning">
                                <strong>Warning:</strong> There are currently <strong>{numberOfUsers}</strong> selected recipients.
                            </div>}
                            <RS.Input
                                type="button" value="Send emails"
                                className={"btn btn-xl btn-secondary border-0 " + classnames({disabled: !canSubmit})}
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to send a ${emailType} email to ${numberOfUsers} user${numberOfUsers > 1 ? "s" : ""}?`)) {
                                        setEmailSent(true);
                                        dispatch(sendContentEmailWithIds(plaintextTemplate, htmlTemplate, emailSubject, emailType, csvIDs));
                                    }
                                }}
                            />
                        </React.Fragment>
                        :
                        <React.Fragment>Request made, to send another refresh.</React.Fragment>
                    }
                </div>
            </RS.CardBody>
        </RS.Card>
    </RS.Container>;
};
