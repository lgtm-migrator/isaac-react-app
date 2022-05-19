import React, {MouseEventHandler, useContext, useState} from "react";
import classNames from "classnames";
import ReactDOM from "react-dom";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {ScrollShadows} from "../ScrollShadows";
import {above, isMobile, useDeviceSize} from "../../../services/device";
import {ExpandableParentContext} from "../../../../IsaacAppTypes";
import {
    PortalInHtmlHook,
    TABLE_COMPATIBLE_PORTAL_HOOKS,
    usePortalInHtmlHooks,
    useStatefulElementRef
} from "./utils";

// A portal component to manage table elements from inside the React DOM
const Table = ({id, html, classes, rootElement}: TableData & {rootElement: HTMLElement}) => {
    const parentElement = rootElement.querySelector(`#table-${id}`);

    const tableHtml = `<table class="${classNames(classes, "table table-bordered w-100 text-center bg-white m-0")}">${html}</table>`;
    const [modifiedHtml, renderPortalElements] = usePortalInHtmlHooks(tableHtml, TABLE_COMPATIBLE_PORTAL_HOOKS);

    const [scrollRef, updateScrollRef] = useStatefulElementRef<HTMLDivElement>();
    const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLElement>();
    const {expandButton, innerClasses, outerClasses} = useExpandContent(classes.includes("expandable"), expandRef, "overflow-auto mb-4");

    if (modifiedHtml && parentElement) {
        return ReactDOM.createPortal(
            <div className={classNames(outerClasses, "position-relative isaac-table")} ref={updateExpandRef}>
                {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
                {SITE_SUBJECT === SITE.CS && window.ResizeObserver && <ScrollShadows element={scrollRef} />}
                {expandButton}
                <div ref={updateScrollRef} className={innerClasses} dangerouslySetInnerHTML={{__html: modifiedHtml}} />
                {renderPortalElements(scrollRef)}
            </div>,
            parentElement
        );
    }
    return null;
}

export const useExpandContent = (expandable: boolean, el?: HTMLElement, unexpandedInnerClasses = "") => {
    const [ expanded, setExpanded ] = useState(false);

    const toggleExpanded: MouseEventHandler = (event) => {
        const newExpanded = !expanded;
        if (newExpanded) {
            el?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
        setExpanded(newExpanded);
    }

    const expandableParent = useContext(ExpandableParentContext);
    const deviceSize = useDeviceSize();

    const show = SITE_SUBJECT === SITE.CS && expandable && !isMobile() && above["md"](deviceSize) && !expandableParent;

    const expandButton = (show && <div className={"expand-button position-relative"}>
        <button type={"button"} onClick={toggleExpanded}>
            <div><span><img aria-hidden alt={"Button to expand content"} src={"/assets/expand-arrow.svg"}/> {expanded ? "Close" : "Expand"}</span></div>
        </button>
    </div>) || null;

    // If screen size goes below md, then the `isaac-expand-bg` class no longer applies (the screen is too thin)
    const innerClasses = (expanded && show) ? "" : unexpandedInnerClasses;
    const outerClasses = show ? (expanded ? "isaac-expand-bg expand-outer" : "expand-outer") : "";

    return {expandButton, innerClasses, outerClasses};
}

interface TableData {
    id: number;
    html: string;
    classes: string[];
    expandable?: boolean;
}

// The component that uses this hook should be using the pattern demonstrated in `TrustedHtml`.
// This pattern is the following:
// - The html produced by this hook is rendered within an element using the `dangerouslySetInnerHTML` attribute. Call this the root element.
// - When calling `renderTables`, *pass the root element*
// - Ensure that the root element is set and updated using the `useStatefulElementRef` hook. This means that when the element
// is added to the DOM, a update occurs for all components that take this element as a prop.
//
// Using this pattern, you can safely nest portal components to an arbitrary depth (as far as I can tell)
export const useAccessibleTablesInHtml: PortalInHtmlHook = (html) => {
    // This is more robust than writing regex, and is surprisingly very quick!
    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;

    const tableElements = [...htmlDom.getElementsByTagName("table")];
    if (tableElements.length === 0) return [html, () => []];

    const tableInnerHTMLs: TableData[] = [];
    // Loop through tables in reverse, so that changes to a nested table will happen before the `innerHtml` of its parent
    // table is recorded in `tableInnerHTMLs`
    for (let i = tableElements.length - 1; i >= 0; i--) {
        const table: HTMLTableElement = tableElements[i];

        // If table is marked as ignored, then pass - this means that it is nested inside another table (and this was
        // found in a prior pass)
        if ("ignore" in table.dataset) continue;

        const tableCurrentClasses = (table.getAttribute("class") || "").split(/\s+/);
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");

        // Only manage the `table` in React if it doesn't have another `table` as an ancestor - `table`s will always have at least
        // a `body` element as an ancestor.
        if (table.parentElement?.closest("table") === null) {
            // This table has no table ancestors, so set it up to manage it within React (so we can add shadows and expand them etc.)
            tableInnerHTMLs.push({id: i, html: table.innerHTML, classes: tableCurrentClasses});
            div.setAttribute("id", `table-${i}`);
            parent.insertBefore(div, table);
            parent.removeChild(table);
        } else {
            // This `table` is inside another `table`, so don't make it a portal element
            table.setAttribute("class", classNames(tableCurrentClasses, "table table-bordered w-100 text-center bg-white m-0"));
            table.dataset.ignore = "true";
            // Insert parent div to handle table overflow
            div.setAttribute("class", "overflow-auto");
            parent.insertBefore(div, table);
            div.appendChild(parent.removeChild(table));
        }
    }
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? tableInnerHTMLs.map(({id, html, classes}) => <Table key={id} rootElement={ref} id={id} html={html} classes={classes}/>) : []
    ];
}