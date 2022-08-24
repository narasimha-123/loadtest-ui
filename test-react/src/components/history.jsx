import React, { useState } from 'react';
import axios from 'axios'; import './components.css';
import './components.css';
import { BsSearch } from "react-icons/bs";
import Table from './table';

const baseURL = "http://localhost:3001/api/tests";
const History = (props) => {
    const URL = baseURL + props.URL;
    const [searchPhrase, setSearchPhrase] = useState("");
    const [testSearchList, setTestSearchList] = useState(props.testList);
    let getTestsInterval = null;

    const componentCleanup = () => { // this will hold the cleanup code
        if (getTestsInterval) {
            clearInterval(getTestsInterval);
        }
    }
    React.useEffect(() => {
        // console.log("Executing useEffect");
        getTestsInterval = searchPhrase ? null : setInterval(function getTests() {
            axios.get(URL).then((response) => {
                setSearchPhrase(searchPhrase => {
                    if (!searchPhrase) {
                        props.setTestList(response.data);
                        setTestSearchList(response.data);
                    }
                    return searchPhrase;
                });
            });
            return getTests;
        }(), 10000);
        console.log(getTestsInterval, ": intId");
        window.addEventListener('beforeunload', componentCleanup);
        window.scrollTo(0, 0);
        return () => {
            componentCleanup();
            window.removeEventListener('beforeunload', componentCleanup);
        }
    }, []);

    if (!testSearchList) return <div className='card m-3 table-border-shadow'><div className='card-body'>Unable to connect to server. Try refreshing the page.</div></div>;

    function updateSearchList(sp) {
        let updatedList = [];
        sp = String(sp).toLowerCase();
        updatedList = props.testList.filter(o =>
            Object.entries(o).some(entry => {
                if (String(entry[0]).match(/createdBy|testName|createdAt/g) && String(entry[1]).toLowerCase().includes(sp)) return true;
                return false;
            })
        );
        setTestSearchList(updatedList);
    }

    function handleChange(event) {
        console.log("changed " + event.target.id + " = " + event.target.value);
        const newPhrase = event.target.value;
        setSearchPhrase(newPhrase);
        updateSearchList(newPhrase);
    }

    return (
        <main role="main" className="pt-3 px-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 my-3 border-bottom">
                <h1 className="h2">Test History</h1>
                <div className="search-box">

                    <i><BsSearch className="align-top" /></i>
                    <input type="text" className="form-control table-border-shadow" id="searchBar" value={searchPhrase} onChange={handleChange} placeholder="Search" />

                </div>
            </div>

            <Table testSearchList={testSearchList} showPagination={true} />
        </main>
    )
}

export default History