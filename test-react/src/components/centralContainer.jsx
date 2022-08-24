import React from 'react';
import axios from 'axios'; 
import './components.css';
import CreateTest from './form';
const baseURL = "http://localhost:3001/api/tests/";
const CentralContainer = (props) => {

    async function handleSubmit() {
        //reload table
        // await new Promise(resolve => setTimeout(resolve, 3000));
        // axios.get(baseURL).then((response) => {
        //     props.setTestList(response.data);
        // });
    }

    return (
        <main role="main" className="pt-3 px-4">
            {window.scrollTo(0, 0)}
            <div className="dd-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 my-3 border-bottom">
                <h2>Tests</h2>
            </div>

            <div className="border bg-white table-border-shadow mt-3 p-3 d-block">
                <CreateTest id="collapseForm" onFormsubmit={handleSubmit} />
            </div>

        </main>
    )
}

export default CentralContainer