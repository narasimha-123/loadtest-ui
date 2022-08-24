import React, { useState } from 'react';
import axios from 'axios'; import './components.css';
import './components.css';
import Table from './table';
import { Col } from 'react-bootstrap';

const ColoredCircle = ({ status }) => {

    let getColor = (status) => {
        switch (status) {
            case 'Error':
                return "red";
            case 'In queue':
                return "yellow";
            case 'Running':
                return "orange";
            case 'Completed':
                return "green";
            default:
                return "black";
        }
    }

    const styles = {
        backgroundColor: getColor(status)
    };

    return status ? (
        <React.Fragment>
            <span className="colored-circle " style={styles} />
            <span>  </span>
        </React.Fragment>
    ) : null;
};

const RunningTest = ({ test }) => {

    return test ? (
        <div className="card rounded-3 table-border-shadow my-2  p-4 pb-0">
                <div className="card-title">
                    <h5>{test.testName} <span className='px-5'>{" "}</span><ColoredCircle status="Running"/>Running for {( (Date.now() - new Date(test.runAt))/1000/60).toFixed(2)} mins</h5>
                </div>
                <div className='row p-0'>
                    <div className="card-body col-8">
                        <table className="table">
                            <tr>
                                <th>Language Feature</th>
                                <th>Created At</th>
                                <th>Created By</th>
                                <th>Duration</th>
                            </tr>
                            <tr>
                                <td>{test.langFeature}</td>
                                <td>{new Date(test.createdAt).toLocaleString("en-UK", {timeZone: 'Asia/Kolkata', hour12: true})}</td>
                                <td>{test.createdBy}</td>
                                <td>{test.time} mins</td>
                            </tr>
                        </table>
                    </div>
                    <div className="card-body p-3  col-4">
                        <b>Status: </b>
                        {test.progress==0?"Initailization":
                        (test.progress<50?"Test running on server":
                            (test.progress<90?"Downloading test results":"Extracting Results"))}
                    </div>
                </div>
            </div>
    ) : null;
};

const baseURL = "http://localhost:3001/api/tests";
const ActiveTests = (props) => {
    const URL_inq = baseURL + props.URL[0];
    const URL_run = baseURL + props.URL[1];
    const [testSearchList, setTestSearchList] = useState(props.testList);
    const [runningTest, setRunningTest] = useState(null);
    let getTestsInterval = null;

    const componentCleanup = () => { // this will hold the cleanup code
        clearInterval(getTestsInterval);
    }

    React.useEffect(() => {
        axios.get(URL_inq).then((response) => {
            setTestSearchList(response.data);
        });
        axios.get(URL_run).then((response) => {
            setRunningTest(response.data);
        });
        getTestsInterval = setInterval(() => {
            axios.get(URL_inq).then((response) => {
                setTestSearchList(response.data);
            });
            axios.get(URL_run).then((response) => {
                setRunningTest(response.data);
            });
        }, 10000);
        window.addEventListener('beforeunload', componentCleanup);
        window.scrollTo(0, 0);
        return () => {
            componentCleanup();
            window.removeEventListener('beforeunload', componentCleanup);
        }
    }, []);
    if (!(testSearchList && runningTest)) return <>Unable to connect to server</>;

    return (
        <main role="main" className="pt-3 px-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 my-3 border-bottom">
                <h1 className="h2">Active Tests</h1>
            </div>
            {runningTest.length ? <RunningTest test={runningTest[0]}/> :
                <div className="card  table-border-shadow mb-2">
                    <div className="card-body">
                        No tests Running
                    </div>
                </div>}
            
            {testSearchList.length ? <Table testSearchList={testSearchList} showPagination={false} /> :
                <div className="card  table-border-shadow">
                    <div className="card-body">
                        No tests in queue
                    </div>
                </div>}
        </main>
    )
}

export default ActiveTests;