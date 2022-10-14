import React from "react";
import {ActiveModal} from "./ActiveModal";
import {AppState, useAppSelector} from "../../../state";
import {LoginOrSignUpModal} from "./LoginOrSignUpModal";
import {IsaacBooksModal} from "./IsaacBooksModal";

export const ActiveModals = () => {
    const activeModals = useAppSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            return <ActiveModal key={modal.title} activeModal={modal}/>
        })}
    </div>
};

export const IsaacModals = () => {
    return <>
        <LoginOrSignUpModal/>
        <IsaacBooksModal/>
    </>;
};
