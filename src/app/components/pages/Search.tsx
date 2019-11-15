import React, {ChangeEvent, FormEvent, MutableRefObject, useEffect, useRef, useState} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {Col, Container, CustomInput, Form, Input, Label, Row} from "reactstrap";
import queryString from "query-string";
import {fetchSearch} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {ContentSummaryDTO, ResultsWrapper} from "../../../IsaacApiTypes";
import {History} from "history";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {DOCUMENT_TYPE} from "../../services/constants";
import {calculateSearchTypes, pushSearchToHistory} from "../../services/search";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {shortcuts} from "../../services/searchResults";
import {LoggedInUser, ShortcutResponses, UserPreferencesDTO} from "../../../IsaacAppTypes";
import {determineExamBoardFrom, filterOnExamBoard} from "../../services/examBoard";
import {AnonUserExamBoardPicker} from "../elements/inputs/AnonUserExamBoardPicker";
import {isStaff} from "../../services/user";

const stateToProps = (state: AppState) => {
    return {
        searchResults: state && state.search && state.search.searchResults || null,
        user: state && state.user || null,
        userPreferences: state ? state.userPreferences : null
    };
};
const dispatchToProps = {fetchSearch};


interface SearchPageProps {
    searchResults: ResultsWrapper<ContentSummaryDTO> | null;
    userPreferences: UserPreferencesDTO | null;
    user: LoggedInUser | null;
    history: History;
    location: Location;
    fetchSearch: (query: string, types: string) => void;
}

const SearchPageComponent = (props: SearchPageProps) => {
    const {searchResults, user, location, history, fetchSearch, userPreferences} = props;

    const searchParsed = queryString.parse(location.search);

    const examBoard = determineExamBoardFrom(userPreferences);

    const queryParsed = searchParsed.query || "";
    const query = queryParsed instanceof Array ? queryParsed[0] : queryParsed;

    const filterParsed = (searchParsed.types || (DOCUMENT_TYPE.QUESTION + "," + DOCUMENT_TYPE.CONCEPT));
    const filters = (filterParsed instanceof Array ? filterParsed[0] : filterParsed).split(",");

    const problems = filters.includes(DOCUMENT_TYPE.QUESTION);
    const concepts = filters.includes(DOCUMENT_TYPE.CONCEPT);

    let [searchText, setSearchText] = useState(query);
    let [searchFilterProblems, setSearchFilterProblems] = useState(problems);
    let [searchFilterConcepts, setSearchFilterConcepts] = useState(concepts);
    let [shortcutResponse, setShortcutResponse] = useState<(ShortcutResponses | ContentSummaryDTO)[]>();

    useEffect(
        () => {
            setSearchText(query);
            setSearchFilterProblems(problems);
            setSearchFilterConcepts(concepts);
            fetchSearch(query, calculateSearchTypes(problems, concepts));
        },
        [query, problems, concepts]
    );

    function doSearch(e?: FormEvent<HTMLFormElement>) {
        if (e) {
            e.preventDefault();
        }
        if (searchText != query || searchFilterProblems != problems || searchFilterConcepts != concepts) {
            pushSearchToHistory(history, searchText, searchFilterProblems, searchFilterConcepts);
        }
        if (searchText) {
            setShortcutResponse(shortcuts(searchText))
        }
    }

    const timer: MutableRefObject<number | undefined> = useRef();
    useEffect(() => {
        timer.current = window.setTimeout(() => {
            doSearch();
        }, 800);
        return () => {
            clearTimeout(timer.current);
        };
    }, [searchText]);

    useEffect(() => {
        doSearch();
    }, [searchFilterProblems, searchFilterConcepts]);

    const filterResult = function(r: ContentSummaryDTO) {
        const keepElement = (r.id != "_regression_test_" && (!r.tags || r.tags.indexOf("nofilter") < 0 && !r.supersededBy));
        return keepElement || isStaff(user);
    };

    const filteredSearchResults = searchResults && searchResults.results && filterOnExamBoard(searchResults.results.filter(filterResult), examBoard);

    const shortcutAndFilteredSearchResults = (shortcutResponse || []).concat(filteredSearchResults || []);

    return (
        <Container id="search-page">
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Search" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form inline onSubmit={doSearch}>
                        <Input
                            className='search--filter-input mt-4'
                            type="search" value={searchText}
                            placeholder="Search"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                        />
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col className="py-4">
                    <RS.Card>
                        <RS.CardHeader className="search-header">
                            <Col md={5} xs={12}>
                                <h3>
                                    <span className="d-none d-sm-inline-block">Search&nbsp;</span>Results {query != "" ? shortcutAndFilteredSearchResults ? <RS.Badge color="primary">{shortcutAndFilteredSearchResults.length}</RS.Badge> : <RS.Spinner color="primary" /> : null}
                                </h3>
                            </Col>
                            <Col md={7} xs={12}>
                                <Form inline className="search-filters">
                                    <Label className="d-none d-sm-inline-block">Filter</Label>
                                    <Label><CustomInput id="problem-search" type="checkbox" defaultChecked={searchFilterProblems} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchFilterProblems(e.target.checked)} />Search problems</Label>
                                    <Label><CustomInput id="concept-search" type="checkbox" defaultChecked={searchFilterConcepts} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchFilterConcepts(e.target.checked)} />Search concepts</Label>
                                    <Label><AnonUserExamBoardPicker className="text-right" /></Label>
                                </Form>
                            </Col>
                        </RS.CardHeader>
                        {query != "" && <RS.CardBody>
                            <ShowLoading until={shortcutAndFilteredSearchResults}>
                                {shortcutAndFilteredSearchResults && shortcutAndFilteredSearchResults.length > 0 ?
                                    <LinkToContentSummaryList items={shortcutAndFilteredSearchResults} displayTopicTitle={true}/>
                                    : <em>No results found</em>}
                            </ShowLoading>
                        </RS.CardBody>}
                    </RS.Card>
                </Col>
            </Row>
        </Container>
    );
};

export const Search = withRouter(connect(stateToProps, dispatchToProps)(SearchPageComponent));
