import React, { useEffect, useState } from "react";
import {connect, useDispatch, useSelector} from "react-redux";
import {closeActiveModal, loadGroups, selectGroup, getGroupMembers, getEventBookingsForGroup} from "../../../state/actions";
import {store} from "../../../state/store";
import {
    Button,
    Col,
    CustomInput,
    Row
} from "reactstrap";
import {RegisteredUserDTO, UserGroupDTO, UserSummaryDTO} from "../../../../IsaacApiTypes";
import {AppState, user} from "../../../state/reducers";
import {groups} from '../../../state/selectors';
import { ShowLoading } from "../../handlers/ShowLoading";
import { AppGroup, AppGroupMembership } from "../../../../IsaacAppTypes";
import { NOT_FOUND } from "../../../services/constants";
import _orderBy from "lodash/orderBy";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state),
    currentGroup: groups.current(state)
});
const dispatchToProps = { groups, loadGroups, selectGroup, getGroupMembers };

interface ReservationsModalProps {
    user: RegisteredUserDTO;
    groups: UserGroupDTO[] | null;
    currentGroup: AppGroup | null;
    loadGroups: (archivedGroupsOnly: boolean) => void;
    selectGroup: (group: UserGroupDTO | null) => void;
    getGroupMembers: (group: UserGroupDTO) => void;
}

const ReservationsModalComponent = (props: ReservationsModalProps) => {
    const { user, groups, loadGroups, currentGroup } = props;
    const dispatch = useDispatch();

    const [unbookedUsers, setUnbookedUsers] = useState<AppGroupMembership[]>([]);
    const [userCheckboxes, setUserCheckboxes] = useState<{[key: number]: boolean}>({});
    const [checkAllCheckbox, setCheckAllCheckbox] = useState<boolean>(false);

    const selectedEvent = useSelector((state: AppState) => state && state.currentEvent !== NOT_FOUND && state.currentEvent || null);

    useEffect(() => {
        loadGroups(false);
    }, []);

    useEffect(() => {
        if (currentGroup && !currentGroup.members) {
            dispatch(getGroupMembers(currentGroup));
        } else if (currentGroup && currentGroup.members) {
            // TODO: Retrieve event status for members maybe?
        }
    }, [currentGroup]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id));
        }
    }, [currentGroup]);
    
    const eventBookingsForGroup = useSelector((state: AppState) => state && state.eventBookingsForGroup || []);

    useEffect(() => {
        // TODO: Check the API (EventsFacade), it returns the wrong type of users
        //       (i.e., the one with an email address attached) even when the
        //       request comes from a TEACHER.
        if (currentGroup && currentGroup.members) {
            const bookedUserIds = eventBookingsForGroup.map(booking => booking.userBooked && booking.userBooked.id);
            const newUnbookedUsers: AppGroupMembership[] = _orderBy(currentGroup.members.filter(member => !bookedUserIds.includes(member.id as number)), ['authorisedFullAccess', 'familyName', 'givenName'], ['desc', 'asc', 'asc']);
            let newUserCheckboxes: boolean[] = []; //{[key: number]: boolean} = {}
            for (const id of newUnbookedUsers.map(user => user.id)) {
                // TODO: Exclude users who have not authorisedFullAccess.
                if (!id) continue;
                newUserCheckboxes[id] = false;
            }
            setUserCheckboxes(newUserCheckboxes);
            setUnbookedUsers(newUnbookedUsers);
        }
    }, [eventBookingsForGroup])

    const toggleCheckboxForUser = (userId?: number) => {
        if (!userId) return;
        let checkboxes = { ...userCheckboxes };
        checkboxes[userId] = !checkboxes[userId];
        setUserCheckboxes(checkboxes);
        setCheckAllCheckbox(Object.values(checkboxes).every(v => v));
    }

    const toggleAllUnbooked = () => {
        setCheckAllCheckbox(!checkAllCheckbox);
        let checkboxes = { ...userCheckboxes };
        for (const id in userCheckboxes) {
            checkboxes[id] = !checkAllCheckbox;
        }
        setUserCheckboxes(checkboxes);
    }

    return <React.Fragment>
        <pre>
            bookings: { JSON.stringify(eventBookingsForGroup) }<br />
            unbooked: { JSON.stringify(unbookedUsers) }
        </pre>
        <Row>
            <Col md={4}>
                <ShowLoading until={groups}>
                    {groups && groups.map(group => (
                        <Row key={group.id}>
                            <Col>
                                <div className="group-item p-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Button color="link text-left" className="flex-fill" onClick={() => {dispatch(selectGroup(group))}}>
                                            {(currentGroup === group ? "»" : "")} {group.groupName}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))}
                </ShowLoading>
            </Col>
            {(!currentGroup || !currentGroup.members) && <Col>
                <p>Select one of your groups from the list to see its members.</p>
            </Col>}
            {currentGroup && currentGroup.members && currentGroup.members.length == 0 && <Col>
                <p>This group has no members. Please select another group.</p>
            </Col>}
            {currentGroup && currentGroup.members && currentGroup.members.length > 0 && <Col>
                <Row className="mb-3 booked-users">
                    <Col>Booked
                        <Row>
                            <Col>Student</Col>
                            <Col>Status</Col>
                            <Col>Reserved by</Col>
                        </Row>
                        {eventBookingsForGroup.length > 0 && eventBookingsForGroup.map(booking => {
                            return (booking.userBooked && booking.userBooked.id && <Row>
                                <Col>{booking.userBooked && <CustomInput key={booking.userBooked.id}
                                                                         id={`${booking.userBooked.id}`}
                                                                         type="checkbox"
                                                                         name={`booked_student-${booking.userBooked.id}`}
                                                                         label={booking.userBooked.givenName + " " + booking.userBooked.familyName}
                                                                         checked
                                                                         disabled={!booking.userBooked.authorisedFullAccess}
                                                            />}
                                </Col>
                                <Col>{booking.bookingStatus}</Col>
                                <Col></Col>
                            </Row>)
                        })}
                        {eventBookingsForGroup.length == 0 && <p>None of the members of this group are booked in for this event.</p>}
                    </Col>
                </Row>
                <Row className="mb-3 unbooked-users">
                    <Col>Unbooked
                        <Row>
                            <Col>
                                <CustomInput id="check_all_unbooked"
                                             type="checkbox"
                                             label="Check all unbooked students"
                                             checked={checkAllCheckbox}
                                             onChange={() => toggleAllUnbooked()}
                                />
                            </Col>
                        </Row>
                        {unbookedUsers.length > 0 && unbookedUsers.map(user => {
                            return (user.id && <Row>
                                <Col><CustomInput key={user.id}
                                                  id={`${user.id}`}
                                                  type="checkbox"
                                                  name={`unbooked_student-${user.id}`}
                                                  label={user.givenName + " " + user.familyName}
                                                  checked={userCheckboxes[user.id]}
                                                  disabled={!user.authorisedFullAccess}
                                                  onChange={() => toggleCheckboxForUser(user.id)}
                                     />
                                </Col>
                                <Col></Col>
                                <Col></Col>
                            </Row>)
                        })}
                        {unbookedUsers.length == 0 && <p>All the members have a booking or reservation for this event.</p>}
                    </Col>
                </Row>
                <Row className="mb-5 toolbar">
                    <Col><Button disabled={!Object.values(userCheckboxes).some(v => v)}>Reserve</Button></Col>
                </Row>
            </Col>}
        </Row>
    </React.Fragment>
}

export const reservationsModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        size: 'xl',
        title: "Groups and Reservations",
        body: <ReservationsModal />,
        // buttons: [
        //     <RS.Button key={0} block color="primary" tag="a"  target="_blank" rel="noopener noreferer" onClick={() => {store.dispatch(closeActiveModal())}}>
        //         Download CSV
        //     </RS.Button>,
        // ]
    }
};

export const ReservationsModal = connect(stateToProps, dispatchToProps)(ReservationsModalComponent);