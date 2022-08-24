import { React, useEffect, useState } from 'react';
import axios from 'axios'; import './components.css';
import './components.css';
import {
    useParams,
    useNavigate,
    useMatch
} from "react-router-dom";
const inputFileList = require("../assets/inputFileList.json");
const envList = {
    'int': 'Integration',
    'preprod': 'Preproduction'
}

const baseURL = "http://localhost:3001/api/tests/";
const Tests = (props) => {
    const navigate = useNavigate();
    const match = useMatch('/tests/:id');
    const id = useParams();
    const [test, setTest] = useState(null);
    let URL = baseURL + id.id;
    // console.log(URL);
    // console.log(match);
    useEffect(() => {
        axios.get(URL).then((response) => {
            console.log(response.data);
            setTest(response.data);
        });
        window.scrollTo(0, 0);
    }, []);
    function downloadFolder() {
        // axios.get(URL+"/result").then((response) => {
        // });
        axios({
            url: URL + "/result", //your url
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${id.id}.zip`); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }
    function downloadLog() {
        axios({
            url: URL + "/log-file", //your url
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${id.id}.log`); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }
    function handleDelete() {
        axios
            .delete(`${URL}`)
            .then(() => {
                alert("Test deleted!");
                navigate("/history", { replace: true });
            }).catch((e) => {
                alert("Error while deleting test");
                navigate("/history", { replace: true });
            });
    }
    if (!test) return (
        <div><h1>Error getting test results</h1></div>
    );
    // function handleResults(data) {
    //     navigate(
    //         `${match.pathname}/results`,
    //         {
    //             state: {
    //                 id: id.id,
    //                 folder: test.test_folder
    //             }
    //         });
    // }
    return (
        <main role="main" className="pt-3 px-4">
            <div className="d-flex flex-wrap flex-md-nowrap align-items-center pb-2 my-3 border-bottom">
                <h2>Test Results:</h2><h3>{test.testName}</h3>
                <div className="btn-group ms-auto">
                    <button type="button" className="btn btn-outline-primary mx-2" onClick={downloadFolder} disabled={test.status=="Error"}>Download Result as Zip</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDelete}>Delete Test</button>
                </div>
            </div>
            <div className='row mb-3'>
                <div className='col-4'>
                    {/* Basic Info */}
                    {<div className='card table-border-shadow mb-4'>
                        <div className="card-body">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>Created By: </td>
                                        <td><b>{test.createdBy}</b></td>
                                    </tr>
                                    <tr>
                                        <td>Environment: </td>
                                        <td><b>{envList[test.env]}</b></td>
                                    </tr>
                                    <tr>
                                        <td>Language Feature: </td>
                                        <td><b>{inputFileList[test.langFeature].name}</b></td>
                                    </tr>
                                    <tr>
                                        <td>RPS:</td>
                                        <td> <b>{test.rps} requests/sec</b></td>
                                    </tr>
                                    <tr>
                                        <td>Users:</td>
                                        <td><b>{test.users} users</b></td>
                                    </tr>
                                    <tr>
                                        <td>Time: </td>
                                        <td><b>{test.time} mins</b></td>
                                    </tr>
                                    <tr>
                                        <td>Input File: </td>
                                        <td><b>{test.input}</b> </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>}
                    {/*  Response Time Distribution / Error msg */}
                    {test.status == "Completed" ?
                        <div className="card table-border-shadow">
                            <div className="card-body">
                                <table className='table table-hover'>
                                    <thead>
                                        <tr className='text-center'>
                                            <th colSpan={2}>
                                                Response Time Distribution
                                            </th>
                                        </tr>
                                        <tr>
                                            <th>
                                                Response time (t)
                                            </th>
                                            <th>
                                                # (% of total)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {test.testResults.group1.name}:
                                            </td>
                                            <td>
                                                {test.testResults.group1.count} ({test.testResults.group1.percentage}%)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {test.testResults.group2.name}:
                                            </td>
                                            <td>
                                                {test.testResults.group2.count} ({test.testResults.group2.percentage}%)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {test.testResults.group3.name}:
                                            </td>
                                            <td>
                                                {test.testResults.group3.count} ({test.testResults.group3.percentage}%)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                {test.testResults.group4.name}:
                                            </td>
                                            <td>
                                                {test.testResults.group4.count} ({test.testResults.group4.percentage}%)
                                            </td>
                                        </tr>
                                        <tr></tr>
                                        <tr></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> : null
                        // <div className="card table-border-shadow">
                        //     <div className="card-body">
                        //         Error: {test.error}
                        //     </div>
                        // </div>
                    }
                </div>
                <div className='col-8'>
                    {/* Global Results */}
                    {test.status == "Completed" && <div className="card  table-border-shadow">
                        <div className="card-body">
                            <table className='table table-hover'>
                                <thead>
                                    <tr className='text-center'>
                                        <th colSpan={4}>
                                            Global Results
                                        </th>
                                    </tr>
                                    {/* </thead>
                                <thead> */}
                                    <tr>
                                        <th>
                                            Stat
                                        </th>
                                        <th>
                                            #
                                        </th>
                                        <th>
                                            OK
                                        </th>
                                        <th>
                                            KO
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            Number Of Requests:
                                        </td>
                                        <td>
                                            {test.testResults.numberOfRequests.total}
                                        </td>
                                        <td>
                                            {test.testResults.numberOfRequests.ok}
                                        </td>
                                        <td>
                                            {test.testResults.numberOfRequests.ko}
                                        </td>

                                    </tr>
                                    <tr>
                                        <td>
                                            Min Response Time:
                                        </td>
                                        <td>
                                            {test.testResults.minResponseTime.total}
                                        </td>
                                        <td>
                                            {test.testResults.minResponseTime.ok}
                                        </td>
                                        <td>
                                            {test.testResults.minResponseTime.ko}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Standard deviation:
                                        </td>
                                        <td>
                                            {test.testResults.standardDeviation.total}
                                        </td>
                                        <td>
                                            {test.testResults.standardDeviation.ok}
                                        </td>
                                        <td>
                                            {test.testResults.standardDeviation.ko}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Max Response Time:
                                        </td>
                                        <td>
                                            {test.testResults.maxResponseTime.total}
                                        </td>
                                        <td>
                                            {test.testResults.maxResponseTime.ok}
                                        </td>
                                        <td>
                                            {test.testResults.maxResponseTime.ko}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Mean Response Time:
                                        </td>
                                        <td>
                                            {test.testResults.meanResponseTime.total}
                                        </td>
                                        <td>
                                            {test.testResults.meanResponseTime.ok}
                                        </td>
                                        <td>
                                            {test.testResults.meanResponseTime.ko}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Mean Requests per sec:
                                        </td>
                                        <td>
                                            {parseFloat(test.testResults.meanNumberOfRequestsPerSecond.total).toFixed(2)}
                                        </td>
                                        <td>
                                            {parseFloat(test.testResults.meanNumberOfRequestsPerSecond.ok).toFixed(2)}
                                        </td>
                                        <td>
                                            {parseFloat(test.testResults.meanNumberOfRequestsPerSecond.ko).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>}
                </div>
            </div>
            {/* `https://localhost:8000/${test._id}/${test.test_folder}/index.html` */}
            {/* ../../results/${test._id}/${test.test_folder}/index.html */}
            {test.status == "Completed" && <iframe className='table-border-shadow w-100 bg-white' src={`../results/${test._id}/${test.test_folder}/index.html`} width="1000" height="1000" frameborder="0">
            </iframe>}
            <div className='row mb-5'>
            </div>
        </main>
    )
}

export default Tests